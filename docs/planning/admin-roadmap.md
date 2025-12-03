# Admin 端功能扩展规划

## 📋 目录

- [已实现功能](#已实现功能)
- [功能扩展规划](#功能扩展规划)
- [优先级路线图](#优先级路线图)
- [技术选型](#技术选型)

---

## ✅ 已实现功能

### 1. Dashboard (仪表盘)

- 漫画总数统计
- 基础数据展示

### 2. Comics Management (漫画管理)

- 漫画列表展示
- 搜索功能
- 封面显示
- 刷新列表

### 3. Users Management (用户管理)

- 用户列表 CRUD
- 角色管理 (admin/user)
- 用户创建/编辑/删除

### 4. 基础导航

- 侧边栏菜单
- 响应式布局
- 深色模式支持

---

## 🎯 功能扩展规划

### 阶段一：核心功能增强 (高优先级)

#### 1. Dashboard 数据可视化

**目标**: 将仪表盘从静态数字转变为动态数据中心

**功能点**:

```typescript
interface DashboardData {
  // 统计数据
  statistics: {
    totalComics: number;
    totalUsers: number;
    totalReads: number;
    storageUsed: string;
  };

  // 趋势数据
  trends: {
    comicsGrowth: TrendData[]; // 漫画增长趋势
    userActivity: TrendData[]; // 用户活跃度
    popularComics: Comic[]; // 热门漫画 TOP 10
  };

  // 最近活动
  recentActivities: Activity[];
}
```

**UI 组件**:

- 📊 ECharts 图表集成
- 📈 折线图：漫画上传趋势
- 🥧 饼图：存储空间分布
- 📋 卡片：最近活动流

**技术要点**:

```bash
pnpm add echarts vue-echarts
```

---

#### 2. 文件管理系统

**目标**: 完整的文件浏览和管理功能

**功能模块**:

##### 2.1 文件浏览器

```
/files
├─ 📁 列表视图
│  ├─ 文件名、大小、类型
│  ├─ 创建/修改时间
│  └─ 操作按钮
├─ 🖼️ 缩略图视图
└─ 🔍 搜索和过滤
```

##### 2.2 批量上传

- 拖拽上传
- 进度显示
- 多文件队列
- 上传失败重试

##### 2.3 文件扫描

```typescript
interface ScanTask {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  foundFiles: number;
  scannedPath: string;
}
```

##### 2.4 存储分析

- 空间使用情况
- 文件类型分布
- 孤立文件检测
- 重复文件查找

**API 端点**:

```typescript
POST   /files/upload       // 上传文件
POST   /files/scan         // 扫描目录
GET    /files              // 获取文件列表
DELETE /files/:id          // 删除文件
GET    /files/analysis     // 存储分析
```

---

#### 3. 漫画管理增强

**当前**: 仅显示列表  
**目标**: 完整的 CRUD + 高级功能

##### 3.1 漫画编辑

```vue
<template>
  <form @submit.prevent="handleSave">
    <input v-model="comic.title" placeholder="标题" />
    <input v-model="comic.author" placeholder="作者" />
    <textarea v-model="comic.description" placeholder="描述" />
    <TagSelector v-model="comic.tags" />
    <CoverUploader v-model="comic.cover" />
  </form>
</template>
```

##### 3.2 批量操作

- ☑️ 多选模式
- 🗑️ 批量删除
- 🏷️ 批量标签
- 📁 批量移动

##### 3.3 漫画详情页

```
/comics/:id/detail
├─ 基本信息
├─ 章节列表 (可排序)
├─ 阅读统计
├─ 用户评分
└─ 评论管理
```

---

#### 4. 系统设置页面

**目标**: 集中管理所有配置

**设置分类**:

```typescript
interface SystemSettings {
  // 基础设置
  general: {
    siteName: string;
    siteDescription: string;
    logo: string;
    timezone: string;
  };

  // 存储设置
  storage: {
    comicPath: string;
    cachePath: string;
    maxFileSize: number; // MB
    autoCleanup: boolean;
  };

  // 阅读设置
  reading: {
    defaultMode: 'single' | 'double' | 'scroll';
    imageQuality: 'low' | 'medium' | 'high';
    preloadPages: number;
  };

  // 安全设置
  security: {
    enableRegistration: boolean;
    minPasswordLength: number;
    sessionTimeout: number; // minutes
  };
}
```

**UI 布局**:

```
┌─────────────────────────────────────┐
│ ⚙️ 系统设置                          │
├──────────┬──────────────────────────┤
│ 基础设置  │ 网站名称: [______]       │
│ 存储设置  │ 网站描述: [______]       │
│ 阅读设置  │ Logo: [上传]             │
│ 安全设置  │ 时区: [UTC+8]            │
└──────────┴──────────────────────────┘
```

---

### 阶段二：运维功能 (中优先级)

#### 5. 系统日志

**功能**: 完整的日志记录和查询系统

**日志类型**:

```typescript
enum LogLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  DEBUG = 'debug',
}

interface SystemLog {
  id: string;
  level: LogLevel;
  message: string;
  module: string;
  userId?: string;
  ip?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}
```

**功能点**:

- 📝 日志列表（分页）
- 🔍 高级搜索（时间、级别、模块）
- 📊 日志统计
- 💾 导出日志
- 🗑️ 自动清理

---

#### 6. 备份和恢复

**目标**: 数据安全保障

**功能模块**:

##### 6.1 备份管理

```typescript
interface Backup {
  id: string;
  name: string;
  type: 'full' | 'incremental';
  size: number;
  createdAt: Date;
  status: 'completed' | 'failed';
}
```

##### 6.2 功能列表

- 🔄 一键备份
- ⏰ 定时备份
- 📦 备份文件列表
- ⬇️ 下载备份
- ♻️ 恢复数据
- 🗑️ 删除备份

**备份内容**:

- 数据库
- 配置文件
- 用户上传文件（可选）

---

#### 7. 任务管理

**目标**: 后台任务监控和管理

**任务类型**:

```typescript
interface Task {
  id: string;
  name: string;
  type: 'scan' | 'thumbnail' | 'backup' | 'cleanup';
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startTime?: Date;
  endTime?: Date;
  error?: string;
}
```

**UI 界面**:

```
任务队列
├─ 扫描新漫画    [运行中] ████████░░ 80%
├─ 生成缩略图    [队列中] ─────────  0%
└─ 数据备份      [已完成] ██████████ 100%

[新建任务] [暂停] [恢复] [取消]
```

---

### 阶段三：数据分析 (中优先级)

#### 8. 阅读统计

**目标**: 深入了解用户行为

**数据维度**:

```typescript
interface ReadingStats {
  // 总体统计
  overview: {
    totalReads: number;
    activeUsers: number;
    avgReadTime: number;
  };

  // 趋势分析
  trends: {
    daily: TimeSeriesData[];
    weekly: TimeSeriesData[];
    monthly: TimeSeriesData[];
  };

  // 排行榜
  rankings: {
    popularComics: Comic[];
    activeUsers: User[];
    topTags: Tag[];
  };
}
```

**可视化**:

- 📈 阅读量趋势图
- 🏆 热门漫画排行
- 👥 活跃用户分析
- 🕐 阅读时间分布

---

#### 9. 标签管理

**目标**: 内容分类和组织

**功能**:

```typescript
interface Tag {
  id: string;
  name: string;
  color: string;
  usageCount: number;
  createdAt: Date;
}

// CRUD 操作
- 创建标签
- 编辑标签
- 删除标签（检查关联）
- 合并标签
- 标签统计
```

---

### 阶段四：高级功能 (低优先级)

#### 10. 权限管理系统

**目标**: 细粒度权限控制

**角色定义**:

```typescript
interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

enum Permission {
  // 漫画权限
  COMIC_VIEW = 'comic:view',
  COMIC_CREATE = 'comic:create',
  COMIC_EDIT = 'comic:edit',
  COMIC_DELETE = 'comic:delete',

  // 用户权限
  USER_VIEW = 'user:view',
  USER_MANAGE = 'user:manage',

  // 系统权限
  SYSTEM_SETTINGS = 'system:settings',
  SYSTEM_LOGS = 'system:logs',
}
```

**权限矩阵**:

```
        | View | Create | Edit | Delete |
--------|------|--------|------|--------|
Admin   |  ✓   |   ✓    |  ✓   |   ✓    |
Editor  |  ✓   |   ✓    |  ✓   |   ✗    |
Viewer  |  ✓   |   ✗    |  ✗   |   ✗    |
```

---

#### 11. 系统监控

**目标**: 实时监控系统状态

**监控指标**:

```typescript
interface SystemMetrics {
  cpu: {
    usage: number; // 百分比
    cores: number;
  };
  memory: {
    total: number;
    used: number;
    free: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
  };
  api: {
    avgResponseTime: number;
    requestCount: number;
    errorRate: number;
  };
}
```

**告警规则**:

- ⚠️ 磁盘使用 > 90%
- ⚠️ 内存使用 > 85%
- ⚠️ API 错误率 > 5%
- ⚠️ 响应时间 > 3s

---

#### 12. 通知系统

**目标**: 及时通知重要事件

**通知类型**:

```typescript
interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  actions?: NotificationAction[];
}
```

**触发场景**:

- 新用户注册
- 漫画上传完成
- 任务执行完成/失败
- 系统告警
- 存储空间不足

---

## 🗺️ 优先级路线图

### Phase 1: 核心增强 (第 1-2 周)

✅ 已完成:

- Dashboard
- Comics 基础
- Users 管理

🎯 下一步:

1. **Dashboard 数据可视化** (3天)
2. **系统设置页面** (2天)
3. **漫画编辑功能** (3天)

### Phase 2: 文件管理 (第 3-4 周)

1. **文件浏览器** (4天)
2. **批量上传** (2天)
3. **文件扫描** (2天)
4. **存储分析** (2天)

### Phase 3: 运维工具 (第 5-6 周)

1. **系统日志** (3天)
2. **备份恢复** (3天)
3. **任务管理** (3天)

### Phase 4: 数据分析 (第 7-8 周)

1. **阅读统计** (4天)
2. **标签管理** (2天)
3. **报表导出** (2天)

### Phase 5: 高级功能 (按需实现)

1. 权限系统
2. 系统监控
3. 通知系统
4. API 文档

---

## 🛠️ 技术选型

### 前端依赖

#### 图表可视化

```bash
# ECharts - 推荐
pnpm add echarts vue-echarts

# 或 Chart.js
pnpm add chart.js vue-chartjs
```

#### 文件上传

```bash
# Uppy - 现代化上传
pnpm add @uppy/core @uppy/vue @uppy/drag-drop

# 或使用原生实现
```

#### 富文本编辑器

```bash
# TipTap - Vue 3 原生
pnpm add @tiptap/vue-3 @tiptap/starter-kit
```

#### 日期时间

```bash
# Day.js - 轻量级
pnpm add dayjs
```

#### 工具库

```bash
# 已安装
- @vueuse/core        # 组合式工具
- Vue Router          # 路由
- Pinia               # 状态管理
- Tailwind CSS v4     # 样式
```

### 后端扩展

#### 需要新增的模块

```
apps/backend/src/modules/
├─ files/          # 文件管理
├─ logs/           # 日志系统
├─ backups/        # 备份管理
├─ tasks/          # 任务队列
├─ stats/          # 数据统计
├─ settings/       # 系统设置
└─ notifications/  # 通知系统
```

#### 推荐的包

```bash
# 任务队列
pnpm add bull @nestjs/bull

# 定时任务
pnpm add @nestjs/schedule

# 文件处理
pnpm add archiver  # 压缩
pnpm add multer    # 已安装

# 日志
pnpm add winston @nestjs/winston
```

---

## 📊 数据模型示例

### Files (文件)

```typescript
@Entity()
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  filename: string;

  @Column()
  path: string;

  @Column()
  size: number;

  @Column()
  mimeType: string;

  @Column({ nullable: true })
  comicId?: string;

  @CreateDateColumn()
  uploadedAt: Date;
}
```

### Logs (日志)

```typescript
@Entity()
export class SystemLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  level: string; // info, warn, error

  @Column()
  module: string;

  @Column('text')
  message: string;

  @Column({ type: 'json', nullable: true })
  metadata?: any;

  @CreateDateColumn()
  createdAt: Date;
}
```

### Tasks (任务)

```typescript
@Entity()
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  type: string; // scan, backup, cleanup

  @Column()
  status: string; // pending, running, completed, failed

  @Column({ default: 0 })
  progress: number;

  @Column({ type: 'json', nullable: true })
  result?: any;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  completedAt?: Date;
}
```

---

## 📝 开发规范

### 文件命名

```
views/        - 大驼峰 (Dashboard.vue)
components/   - 大驼峰 (FileUploader.vue)
api/          - 小驼峰 (filesService.ts)
stores/       - 小驼峰 (settingsStore.ts)
```

### Git Commit 规范

```
feat: 新增功能
fix: 修复 Bug
refactor: 重构
docs: 文档更新
style: 样式调整
perf: 性能优化
test: 测试相关
chore: 构建/配置
```

### API 路由规范

```
GET    /api/resource       - 列表
GET    /api/resource/:id   - 详情
POST   /api/resource       - 创建
PATCH  /api/resource/:id   - 更新
DELETE /api/resource/:id   - 删除
```

---

## 🎨 UI/UX 设计原则

1. **一致性**: 所有页面使用统一的布局和样式
2. **响应式**: 适配桌面和平板设备
3. **反馈**: 操作后提供明确的成功/失败提示
4. **加载状态**: 异步操作显示 Loading
5. **空状态**: 无数据时显示引导信息
6. **错误处理**: 友好的错误提示

---

## 📚 参考资源

- [Vue 3 官方文档](https://vuejs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [ECharts](https://echarts.apache.org/)
- [NestJS 文档](https://nestjs.com/)
- [TypeORM](https://typeorm.io/)

---

**文档版本**: v1.0  
**最后更新**: 2025-11-29  
**维护者**: Development Team
