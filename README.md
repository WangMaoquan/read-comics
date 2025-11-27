# Read Comics

一个现代化的本地漫画阅读应用，支持 ZIP/CBZ 格式。基于 Vue 3 + NestJS 构建，提供流畅的阅读体验。

## ✨ 特性

- 📚 **漫画库管理**：自动扫描并导入本地漫画文件
- 📖 **流畅阅读**：支持单页/双页模式，自动预加载，流畅翻页
- 🔍 **智能解析**：支持 ZIP/CBZ 格式，自动识别章节结构
- 🖼️ **高性能**：图片懒加载、预加载、虚拟滚动
- 📱 **响应式设计**：适配桌面端和移动端
- ⚡ **现代技术栈**：Vue 3, Vite, NestJS, TypeScript, TailwindCSS

## 🛠️ 技术栈

### Frontend (`apps/frontend`)

- **Framework**: Vue 3
- **Build Tool**: Vite (Rolldown)
- **State Management**: Pinia
- **Styling**: TailwindCSS v4
- **Router**: Vue Router
- **HTTP Client**: Fetch API with custom wrapper

### Backend (`apps/backend`)

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: MySQL (TypeORM)
- **File Processing**: Sharp (Image processing), Adm-zip/Yauzl (Archive handling)
- **API Documentation**: Swagger/OpenAPI

### Shared (`packages/*`)

- **@read-comics/types**: Shared TypeScript interfaces and types
- **@read-comics/utils**: Shared utility functions

## 🚀 快速开始

### 前置要求

- Node.js >= 18
- pnpm >= 8
- MySQL Database

### 安装依赖

```bash
pnpm install
```

### 开发环境运行

1. **配置环境变量**

   前端 (`apps/frontend`):

   ```bash
   cp apps/frontend/.env.development.example apps/frontend/.env.development
   ```

   后端 (`apps/backend`):
   确保数据库配置正确（通常在 `.env` 或 `app.module.ts` 中配置）。

2. **启动服务**

   在根目录下运行：

   ```bash
   pnpm dev
   ```

   这将同时启动前端和后端服务。

   或者分别启动：

   ```bash
   pnpm dev:frontend  # 启动前端 (http://localhost:5173)
   pnpm dev:backend   # 启动后端 (http://localhost:4399)
   ```

### 构建生产版本

```bash
pnpm build
```

## 📁 项目结构

```
read-comics/
├── apps/
│   ├── frontend/    # Vue 3 前端应用
│   └── backend/     # NestJS 后端应用
├── packages/
│   ├── types/       # 共享类型定义
│   └── utils/       # 共享工具函数
├── scripts/         # 构建和工具脚本
├── package.json     # 根项目配置 (pnpm workspaces)
└── pnpm-workspace.yaml
```

## 📝 开发规范

- **包管理**: 使用 `pnpm` 进行依赖管理
- **代码风格**: Prettier + ESLint
- **提交规范**: 遵循 Conventional Commits

## 📄 License

MIT
