# Read Comics 后端服务

基于 [NestJS](https://nestjs.com/) 构建，提供核心业务逻辑、文件处理和数据持久化服务。

## ✨ 功能特性

- **漫画管理**：本地文件扫描、解析 (ZIP/CBZ)、元数据提取。
- **图片处理**：
  - 使用 `sharp` 进行高性能图片处理。
  - 智能裁剪、缩放和格式转换。
- **S3 集成**：
  - **零本地存储**：图片直接上传至 S3 兼容对象存储。
  - **预签名 URL**：通过预签名 URL 进行安全快速的内容分发。
  - **云端归档**：将漫画归档至 S3 并自动清理本地文件。
  - **下载重建**：从 S3 流式重建 ZIP 文件，支持按需下载。
- **缓存系统**：多级缓存 (Memory L1 + Redis L2) 确保高性能。
- **用户系统**：基于 JWT 的认证，RBAC 权限控制 (管理员/用户)。
- **阅读进度**：记录每个用户的阅读进度。

## 🛠️ 技术栈

- **框架**: NestJS (Express)
- **语言**: TypeScript
- **数据库**: MySQL + TypeORM
- **缓存**: `cache-manager`, `keyv`, Redis
- **存储**: AWS SDK v3 (S3 Compatible)
- **任务队列**: Bull (计划中)
- **验证**: `class-validator`
- **文档**: Swagger UI

## ⚙️ 配置

复制 `.env.example` 为 `.env` 并进行配置：

```env
# 数据库
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=read_comics
DB_PASSWORD=your_password
DB_DATABASE=read_comics

# Redis
REDIS_LINK=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key

# S3 兼容存储 (MinIO/AWS S3/R2/OSS)
RUSTFS_ACCESS_KEY_ID=your_access_key
RUSTFS_SECRET_ACCESS_KEY=your_secret_key
RUSTFS_ENDPOINT_URL=http://localhost:9000
RUSTFS_BUCKET_PREFIX=read-comics
RUSTFS_REGION=us-east-1

# 本地存储 (扫描路径)
COMICS_PATH=./user-upload
```

## 🚀 运行

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm run start:dev

# 生产环境
pnpm run build
pnpm run start:prod
```

## 📚 API 文档

启动服务后访问：`http://localhost:4399/api`
