# API Client 重构计划与文档

## 1. 背景与目标

在 Monorepo 架构中，Frontend 和 Admin 应用共享同一个 Backend API。目前，两个应用各自维护了一套 API 调用逻辑（Axios 封装、Service 层），导致了以下问题：

- **代码重复**：相同的 API 调用逻辑在两端重复编写。
- **维护成本高**：后端 API 变更时，需要同时修改两个前端应用。
- **类型不一致**：缺乏统一的类型定义，容易出现类型错误。

**目标**：
创建一个共享的 `packages/api-client` 包，统一管理所有 API 调用逻辑、类型定义和配置，实现“一次编写，多处复用”。

## 2. 架构设计

`@read-comics/api-client` 包的结构如下：

```
packages/api-client/
├── src/
│   ├── core/
│   │   ├── client.ts       # 核心 ApiClient 类（封装 Axios，支持拦截器配置）
│   │   └── config.ts       # API 端点常量定义
│   ├── services/           # 具体业务服务
│   │   ├── auth.ts         # 认证服务
│   │   ├── comics.ts       # 漫画服务（待迁移）
│   │   ├── files.ts        # 文件服务（待迁移）
│   │   └── ...
│   └── index.ts            # 统一导出
├── package.json
└── tsconfig.json
```

### 核心设计理念

- **配置解耦**：`ApiClient` 不硬编码 `baseURL` 或 Token 获取逻辑，而是通过构造函数传入配置。这使得它可以在不同环境（Frontend/Admin）中灵活使用。
- **类型安全**：充分利用 TypeScript，结合 `@read-comics/types` 包，确保请求和响应的类型安全。
- **模块化服务**：每个业务领域（Auth, Comics, etc.）对应一个 Service 类，保持代码清晰。

## 3. 当前进度

截至目前（2025-12-03），已完成以下工作：

- [x] **包初始化**：创建了 `packages/api-client`，配置了 `tsup` 构建流程。
- [x] **核心 Client**：实现了 `ApiClient` 类，封装了 Axios 实例，支持自定义拦截器（Token 注入、错误处理）。
- [x] **基础配置**：定义了 `API_ENDPOINTS` 常量，并添加了 `ApiResponse<T>` 标准响应接口。
- [x] **AuthService**：实现了完整的认证服务（登录、注册、忘记密码、重置密码）。
- [x] **ComicsService**：实现了基础的漫画服务（列表、搜索、详情、章节、进度、收藏）。
- [x] **Frontend 集成 Auth**：在 Frontend 中集成了新的 `authService`。
- [x] **Frontend 集成 Comics**：在 Frontend 中集成了新的 `comicsService`。

### 已知限制

由于采用了简化版本的实现，以下功能暂未包含：

- ❌ **请求缓存**：旧版 `apiClient` 支持 `useCache`、`cacheTTL` 和 `invalidateCache`，新版暂未实现。
- ❌ **请求去重**：防止短时间内重复请求同一接口。
- ❌ **请求重试**：网络错误时自动重试机制。

这些功能将在后续优化阶段添加（见第四阶段）。

## 4. 使用指南

### 安装

在应用（如 `apps/frontend`）中安装依赖：

```bash
pnpm add @read-comics/api-client
```

### 初始化

在应用的入口文件（如 `main.ts` 或专门的 `api/index.ts`）中初始化 API：

```typescript
import { createApi } from '@read-comics/api-client';

export const api = createApi({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  getToken: () => localStorage.getItem('token'),
  onUnauthorized: () => {
    // 处理 401，例如跳转登录
    window.location.href = '/login';
  },
  onError: (error) => {
    console.error('API Error:', error);
  },
});

// 导出具体的 Service 以便组件使用
export const { auth: authService, comics: comicsService } = api;
```

### 在组件中使用

```typescript
import { authService, comicsService } from '@/api';

const login = async () => {
  const user = await authService.login({ email, password });
};

const loadComics = async () => {
  const comics = await comicsService.getComics({
    sortBy: 'date',
    sortOrder: 'desc',
  });
};
```

## 5. 后续迁移计划

为了完成重构，我们需要按以下步骤继续进行：

### 第一阶段：迁移剩余 Service (Priority: High)

将 Frontend 和 Admin 中现有的 Service 逻辑迁移到 `api-client`：

1.  ~~**ComicsService**: 列表、详情、章节、阅读进度、收藏。~~ ✅ 已完成
2.  **ChaptersService**: 章节详情、图片列表。
3.  **FilesService**: 上传、扫描、文件解析。
4.  **ImagesService**: 图片加载、缩略图。
5.  **TagsService**: 标签列表、热门标签。
6.  **FavoritesService**: 收藏管理。
7.  **UsersService**: 用户管理（Admin 专用）。
8.  **SystemLogsService**: 系统日志（Admin 专用）。
9.  **TasksService**: 任务管理（Admin 专用）。

### 第二阶段：Frontend 集成 (Priority: Medium)

1.  在 `apps/frontend` 中安装并初始化 `api-client`。
2.  逐步替换现有的 `src/api/services/*.ts` 引用。
3.  验证所有功能（特别是阅读器和图片加载）是否正常。
4.  删除 `apps/frontend/src/api` 下的旧代码。

### 第三阶段：Admin 集成 (Priority: Medium)

1.  在 `apps/admin` 中安装并初始化 `api-client`。
2.  替换现有的 API 调用。
3.  验证管理功能是否正常。
4.  删除 `apps/admin/src/api` 下的旧代码。

### 第四阶段：性能优化与高级功能 (Priority: Low)

1.  **实现请求缓存机制**
    - 在 `ApiClient` 中添加可选的缓存层（基于 LRU 或 Map）
    - 支持配置 `cacheTTL`（缓存有效期）
    - 提供 `invalidateCache` 方法手动清除缓存
    - 兼容现有 Frontend 代码中的缓存使用方式

2.  **请求去重**
    - 检测短时间内的重复请求
    - 复用进行中的请求结果

3.  **自动重试机制**
    - 网络错误时自动重试（可配置次数和延迟）
    - 支持指数退避策略

4.  **代码清理**
    - 检查并移除根目录下可能存在的重复类型定义
    - 优化 `api-client` 的构建体积（Tree-shaking）
    - 完善 API 文档注释和 JSDoc
