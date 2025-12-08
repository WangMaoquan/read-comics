# 方案：去范式化存储阅读进度（Denormalize Reading Progress）

> 目的：为了解决按“阅读进度”排序时的全表加载与内存排序问题，向 `Comic` 实体增加聚合列（`progressPercent`、`readingStatus`），在写入阅读进度时事务性维护这些聚合列，并配套迁移、回填、索引与测试。这样 `findAll` 在按进度排序时可在数据库层完成 ORDER/BY 与分页，显著提升大数据量场景的查询性能与稳定性。

---

## 概览步骤

1. 在 `apps/backend/src/entities/comic.entity.ts` 新增 `progressPercent` 与 `readingStatus` 字段。
2. 新建 TypeORM 迁移：增加列、创建索引（单列 & 复合）、保留 nullable 并提供回填入口。
3. 修改写路径：在 `apps/backend/src/modules/comics/comics.service.ts` 的 `updateProgress` 内事务性维护聚合列（保存 progress → 聚合计算 → 更新 comic）。
4. 回填历史数据：新增分批回填脚本 `apps/backend/scripts/backfillProgress.ts`，用与 `getProgressData` 等价的聚合逻辑填充已有漫画。
5. 修改查询：在 `ComicsService.findAll` 中支持 `sortBy: 'progress'`，当按 progress 排序时在 DB 用 `comic.progressPercent` 做 `ORDER BY` 并在 DB 做分页（retain `enrich` 作字段补充）。
6. 添加/更新测试、监控与前端兼容说明。

---

## 详细方案

### 一、实体变更（设计细节）

- 目标文件/类：`apps/backend/src/entities/comic.entity.ts`，类 `Comic`。
- 新增字段（建议初期 nullable，再回填后设为 non-null）：
  - `progressPercent`（整数，范围 0–100，默认 0）。数据库列名建议：`progress_percent`。
  - `readingStatus`（字符串/enum，取值 `'UNREAD' | 'READING' | 'COMPLETED'`，默认 `'UNREAD'`）。列名建议：`reading_status`。
- 字段设计注意：整型比浮点更好用于索引；初期可允许 nullable 以便分阶段部署；保留现有 `lastReadAt`、`readCount` 字段不变。

### 二、迁移与索引策略

- 迁移文件（TypeORM）：
  - 新增列 `progress_percent` (int) 默认 0；`reading_status` varchar 默认 'UNREAD'（或 DB enum）。
  - 创建索引：单列索引 `idx_comics_progress_percent`；可选复合索引 `idx_comics_progress_pct_id_desc (progress_percent DESC, id DESC)` 用于稳定分页。若常用按状态过滤也建 `idx_comics_reading_status`。
- 回填入口：迁移应支持或触发回填脚本（建议独立脚本分批执行以避免长事务）。
- 部署顺序建议：
  1. 部署迁移（新增列为 nullable，代码可写入新列但仍兼容旧逻辑）。
  2. 部署后端代码变更（`updateProgress` 写入新列）。
  3. 运行回填脚本分批回填所有历史数据。
  4. 将列改为 non-null（如需要）并清理回退代码。

### 三、写路径：事务化维护聚合（关键）

- 文件/符号：`apps/backend/src/modules/comics/comics.service.ts` -> `ComicsService.updateProgress`。
- 事务模型：
  - 使用 `dataSource.transaction(async manager => { ... })` 或 `QueryRunner`，在同一事务内完成：
    1. 保存/更新 `ReadingProgress`（create/update）。
    2. 运行针对该 `comicId` 的聚合查询（在 DB 层计算 readPages、totalPages、completedChapters 等）。
    3. 更新 `comics` 表的 `progressPercent` 与 `readingStatus`（并更新 `lastReadAt` 与 `readCount`）。
  - 若写延迟不可接受，可选用异步更新（消息队列）作为折衷。
- 聚合实现建议：在事务内使用一条或少量 SQL 聚合语句（避免多次 round-trip），结果用于更新 `comics`。
- 错误处理：若聚合/更新失败，应回滚整个事务以保持一致性。

### 四、聚合算法（精确说明，已知 `currentPage` 为 0-based）

- 中间量：
  - `comic_total_pages` = SUM(每章节页数)。来源：`chapters.total_pages` 或 `pages` 数组长度（需统一字段）。
  - per-chapter read-contribution：
    - 若 `progress.isReadComplete = true` → contribute `progress.totalPages`（整章）。
    - 否则 contribute `progress.currentPage + 1`（因为 `currentPage` 为 0-based）。
  - `readPages` = SUM(contributions)（COALESCE(...,0)）。
  - `totalChapters` = COUNT(DISTINCT chapters.id)；`completedChapters` = COUNT(DISTINCT CASE WHEN progress.isReadComplete THEN progress.id END)。
- 输出计算：
  - 若 `comic_total_pages <= 0` → `progressPercent = 0`。
  - 否则 `progressPercent = ROUND((readPages / comic_total_pages) * 100)`（整数）。
  - `readingStatus`：
    - `completedChapters === 0` → `UNREAD`。
    - `completedChapters === totalChapters && totalChapters > 0` → `COMPLETED`。
    - 否则 → `READING`。

### 五、回填脚本（分批、幂等）

- 文件建议：`apps/backend/scripts/backfillProgress.ts`。
- 原则：
  - 分批处理（例如每批 500-2000 条），避免大事务与锁表，用游标或按 id 区间处理。
  - 对每批执行：对该批内所有 `comicId` 运行聚合 SQL（按 `comicId` 分组），得到 `progressPercent` 与 `readingStatus`，然后批量更新 `comics` 表。
  - 验证：先在 QA 环境运行并与现有 `getProgressData` 输出对比（特别关注 `currentPage + 1` 的处理）。
  - 脚本应支持断点续跑（记录已处理最大 id 或批次位置）与重试。

### 六、查询路径改造（`findAll` 变更）

- 文件/符号：`apps/backend/src/modules/comics/comics.service.ts` -> `ComicsService.findAll`。
- 变更点：
  - 支持 `sortBy: 'progress'`（并短期兼容 `sortBy: 'lastReadAt'` 映射到 `progress`）。
  - 当按 `progress` 排序时：在 DB 使用 `ORDER BY comic.progressPercent {ASC|DESC}, comic.id DESC` 并使用 `skip/take` 完成分页，不再先 getMany() 全表读取并在内存排序。
  - 对返回的分页内记录仍可调用 `enrich` 补充额外字段（或直接使用 `comic.progressPercent` / `readingStatus`）。
- 分页稳定性：建议未来支持游标分页（基于 `(progressPercent, lastReadAt, id)`）替代 OFFSET。

### 七、测试与验证

- 单元测试：
  - `updateProgress` 在创建/更新 progress 时正确更新 `progressPercent` 与 `readingStatus`（含 0-based 边界与完成标记）。
  - 回填脚本在小数据集上的正确性与幂等性。
- 集成测试：
  - `findAll` 在 `sortBy: 'progress'` 时按 `progressPercent` 排序并正确分页（含 tie-break）。
- 回归测试：确保未更改的 API 行为（除排序语义外）保持不变。

### 八、前端兼容性

- 建议前端在需要按进度排序时使用 `sortBy: 'progress'`；若前端短期无法改动，后端可兼容 `lastReadAt` 映射到 `progress`。
- 在 `docs/` 或 `implementation/` 中更新 API 参数与排序说明。

### 九、部署与回滚策略

- 分阶段部署：
  1. 部署迁移（新增 nullable 列与索引）。
  2. 部署后端代码：`updateProgress` 写入新列（但暂不启用 DB 排序路径）。
  3. 运行回填脚本分批回填全部历史数据。
  4. 切换 `findAll`：使用 DB 排序（可先通过 feature flag 测试流量）。
  5. 观察指标并清理旧代码/改为 non-null（如需要）。
- 回滚：若发现问题，先关闭新 `findAll` 排序路径并回滚代码；数据列可保留以便再次尝试。

### 十、监控与性能考量

- 监控项：
  - `updateProgress` 的平均/P95 响应时间与事务时长。
  - 回填任务运行时间、失败率与重试次数。
  - `findAll` 在按进度排序下的延迟与索引命中率。
- 性能权衡：
  - 同步聚合更新：读快写慢（适合读多写少）。
  - 异步更新（可选）：写快但最终一致性（使用消息队列异步维护聚合列）。

### 十一、备选方案（若不可做 schema 变更）

- 方案 B（不改 schema）：在 `findAll` 使用 SQL 聚合子查询/派生表：
  - 示例思路：`LEFT JOIN (SELECT comic_id, ROUND(...) as progressPercent FROM ... GROUP BY comic_id) AS progressAgg ON comic.id = progressAgg.comic_id`，然后按 `progressAgg.progressPercent` 排序并在 DB 分页。
  - 优点：无需迁移。缺点：超大数据量或并发下性能不如去范式化列，查询更复杂。
- 使用该方案时务必确保 `progress.chapterId = chapters.id` 的连接条件以避免笛卡尔乘积。

### 十二、开放问题（需在实施前确认）

1. `Chapter` 的“每章页数”来源是哪个字段？`Chapter.pages` 数组长度还是 `Chapter.totalPages`？需统一。
2. 是否接受对数据库做 schema 迁移（你已选择 A：接受）？
3. 在高并发写入场景，是否接受 `updateProgress` 写延迟增加？若不可接受，应考虑异步队列方案。
4. 回填是否必须在维护窗口执行，或允许在线分批回填？（建议在线分批回填）。

---

## Deliverables（可继续生成）

我可以继续为你生成以下任意组合的实现级材料（仅写文档/伪代码，不直接修改源码）：

- 迁移 SQL 草案与 TypeORM 迁移模板（伪代码 + 索引）。
- `updateProgress` 的事务化伪代码（含 QueryRunner/dataSource.transaction 使用示例与聚合 SQL）。
- 回填脚本伪代码（分批、断点续跑、验证逻辑）。
- `findAll` 修改说明与代码差异示例（如何将按进度排序迁移到 DB）。
- 测试用例清单（具体断言与示例数据）。
- 方案 B 的 SQL 子查询示例与性能注意事项。

请回复你要我生成的交付物（例如：`迁移 SQL + 回填脚本 + updateProgress 事务伪代码` 或 `全部`），我会把对应内容以 Markdown 形式输出。
