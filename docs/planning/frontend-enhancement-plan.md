# 前端功能增强实施方案

本方案旨在提升 `read-comics` 前端项目的阅读体验、数据一致性和交互流畅度。

## 1. 阅读进度云端同步 (Priority: High)

目前阅读进度仅保存在本地 `localStorage`，更换设备或清除缓存后进度会丢失。我们需要将进度同步到后端数据库。

### 后端工作 (Backend)

- **目标**: 提供保存和获取阅读进度的 API。
- **涉及文件**:
  - `apps/backend/src/modules/comics/comics.controller.ts` (或新建 `reading-progress` 模块)
  - `apps/backend/src/modules/comics/comics.service.ts`
- **新增接口**:
  - `POST /api/comics/:id/progress`: 更新阅读进度 (chapterId, page, mode)。
  - `GET /api/comics/:id/progress`: 获取当前用户的阅读进度。

### 前端工作 (Frontend)

- **目标**: 在阅读时自动同步进度，并在打开漫画时恢复进度。
- **涉及文件**:
  - `apps/frontend/src/api/services/comicsService.ts`: 添加 API 调用方法。
  - `apps/frontend/src/views/Reader.vue`:
    - 修改 `saveProgress`: 增加防抖 (Debounce) 机制，避免频繁请求，调用 API 保存。
    - 修改 `restoreProgress`: 优先从 API 获取进度，失败则降级读取本地。

## 2. 智能图片预加载 (Priority: High)

为了消除翻页时的白屏等待，提升阅读流畅度。

### 前端工作 (Frontend)

- **目标**: 自动加载当前页之后的 N 张图片。
- **涉及文件**: `apps/frontend/src/views/Reader.vue`
- **实现逻辑**:
  - 维护一个 `preloadQueue`。
  - 监听 `currentPage` 变化。
  - 当用户阅读第 `i` 页时，自动触发第 `i+1` 到 `i+3` 页图片的加载 (`new Image().src = url`)。
  - 考虑带宽限制，避免并发过多请求。

## 3. 图片缩放与平移 (Priority: Medium)

增强单页/双页模式下的细节查看体验。

### 前端工作 (Frontend)

- **目标**: 支持双击放大、滚轮缩放和拖拽平移。
- **涉及文件**: `apps/frontend/src/views/Reader.vue`
- **技术选型**:
  - 使用 `@vueuse/core` 的 `useDraggable` 处理拖拽。
  - 使用 CSS `transform: scale()` 处理缩放。
  - 或者引入轻量级库如 `panzoom` (如果原生实现过于复杂)。
- **交互设计**:
  - **双击**: 在 100% 和 200% 缩放比例间切换。
  - **滚轮**: 细粒度调整缩放比例 (100% - 300%)。
  - **拖拽**: 当缩放比例 > 100% 时，允许拖拽查看图片不同区域。

## 4. 个性化阅读设置 (Priority: Low)

### 前端工作 (Frontend)

- **目标**: 允许用户自定义阅读环境。
- **涉及文件**:
  - `apps/frontend/src/views/Reader.vue`
  - `apps/frontend/src/stores/settings.ts` (新建或更新)
- **新增设置项**:
  - **背景色**: 适配不同光照环境 (深色/浅色/护眼)。
  - **图片适配模式**: 适应宽度 / 适应高度 / 原始大小。
  - **翻页方向**: 左到右 / 右到左 (适配日漫)。

---

## 实施路线图

1.  **第一阶段**: 实现 **阅读进度云端同步**。这是数据层的核心，确保用户数据不丢失。
2.  **第二阶段**: 实现 **智能预加载**。这是体验层的核心，直接影响流畅度。
3.  **第三阶段**: 实现 **图片缩放** 和 **个性化设置**。锦上添花的功能。
