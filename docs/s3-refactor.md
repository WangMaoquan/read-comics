# S3 图片服务重构文档 (S3 Image Service Refactor)

## 1. 概述 (Overview)

本此重构将 `read-comics` 的图片服务（缩略图生成与漫画内页提取）从本地文件系统存储迁移至 **S3 兼容对象存储**。此次变更主要目的是利用 S3 作为持久化缓存和内容分发层（CDN），减轻应用服务器的存储和带宽压力。

## 2. 架构设计 (Architecture)

### 核心变更

- **存储层**：不再将生成的缩略图和解压后的页面保存在本地 `cache` 目录，而是上传至 S3 Bucket。
- **访问层**：API 接口不再直接返回图片文件流（Stream），而是返回 S3 的预签名 URL（Presigned URL），客户端通过 **302 Redirect** 直接从 S3 获取数据。
- **缓存策略**：
  1.  用户请求图片。
  2.  后端计算 S3 Key（路径）。
  3.  检查 S3 中是否存在该文件 (HEAD request)。
  4.  **命中**：直接生成预签名 URL 并返回重定向。
  5.  **未命中**：
      - 从本地漫画文件（ZIP/CBZ）中提取图片。
      - (可选) 进行图片处理/缩略图生成。
      - 上传至 S3。
      - 生成预签名 URL 并返回重定向。

## 3. 目录结构与隔离 (Directory Structure & Isolation)

为了保持 Bucket 的整洁并实现资源隔离（按漫画隔离），采用了以下层级结构：

**所有缓存资源均存放于 `cache/` 前缀下。**

### 3.1 缩略图 (Thumbnails)

```
cache/comics/{comicHash}/thumbnails/{optionsHash}.jpg
```

- `comicHash`: `MD5(comicPath)` - 漫画文件的唯一标识。
- `optionsHash`: `MD5(imagePath + width + height + ...)` - 包含图片路径及处理参数的唯一标识。

### 3.2 漫画内页 (Comic Pages)

```
cache/comics/{comicHash}/pages/{imageHash}.{ext}
```

- `imageHash`: `MD5(imagePath)` - 图片在压缩包内路径的唯一标识。
- `ext`: 原始图片扩展名 (jpg, png, webp 等)。

> **优势**：
>
> - **资源分组**：同一本漫画的所有缓存文件都在同一个目录下，便于管理和清理。
> - **命名空间隔离**：使用 `cache/` 前缀，避免与 Bucket 根目录下的其他数据（如用户上传、备份）冲突。

## 4. 配置说明 (Configuration)

需要在 `apps/backend/.env` 中配置 RUSTFS (S3兼容) 相关的环境变量：

```env
# RESTFS配置 (S3 Compatible Storage)
RUSTFS_ACCESS_KEY_ID=your_access_key
RUSTFS_SECRET_ACCESS_KEY=your_secret_key
RUSTFS_ENDPOINT_URL=https://s3.region.amazonaws.com # 或 minio/oss 地址
RUSTFS_BUCKET_PREFIX=read-comics # Bucket 名称
RUSTFS_REGION=us-east-1 # 区域
```

### 4.1 自动初始化 (Auto-Initialization)

`S3Service` 在模块启动时 (`onModuleInit`) 会尝试自动创建配置中指定的 Bucket（如果不存在）。这简化了部署流程，无需手动预先创建 Bucket。

### 4.2 云端归档 (Cloud Archiving)

即使使用了懒加载，本地 ZIP 文件通常也需要保留作为数据源。为了节省空间，我们提供了**归档功能**：

- **API**: `POST /comics/:id/archive` (仅管理员)
- **行为**:
  1.  扫描漫画所有章节的图片。
  2.  批量将未缓存的图片全部提取并上传到 S3。
  3.  确认上传完成后，**自动删除**本地的 ZIP/CBZ 文件。
- **结果**: 实现“零本地存储”，所有内容均从 S3 读取。

### 4.3 下载重建 (Download Reconstruction)

即便删除了本地 ZIP，我们依然支持**下载功能**。

- **API**: `GET /comics/:id/download`
- **原理**: 实时从 S3 获取每一页图片，通过流式处理 (Stream Pipelining) 重新组装成 ZIP 文件返回给客户端。
- **按需下载**: 支持 `?chapterIds=...` 参数，仅下载指定章节。

## 5. API 变更 (API Changes)

前端调用方式保持不变，但响应行为发生了变化。

### 5.1 查看图片

`GET /images/view?comicPath=...&imagePath=...`

- **旧行为**：返回 `200 OK` 及图片二进制流。
- **新行为**：返回 `302 Found`，`Location` 头指向 S3 预签名 URL。

### 5.2 生成缩略图

`POST /images/thumbnail?comicPath=...`

- **旧行为**：返回 `200 OK` 及图片二进制流。
- **新行为**：返回 `302 Found`，`Location` 头指向 S3 预签名 URL。

> **注意**：标准浏览器 `<img src="...">` 标签会自动处理 302 重定向，因此前端代码不需要通过 JS 手动处理 Redirect，但需确保网络环境能正常访问 S3 Endpoint。

## 6. 代码模块 (Modules)

- **S3Service** (`modules/s3`): 负责 S3 的底层交互（Upload, Head, Presign）。
- **ImagesService** (`modules/images`): 负责业务逻辑，协调本地文件提取、处理与 S3 上传。
- **ImagesController** (`modules/images`): 处理 HTTP 请求，返回重定向响应。

## 7. 代码改进与最佳实践 (Code Improvements & Best Practices)

### 7.1 配置管理 (Configuration Management)

全面引入 `ConfigService` 替代 `process.env`，确保配置的可测试性与安全性。

- **S3Module**: 使用 `ConfigService` 获取 Redis 和 S3 配置。
- **AuthModule**: 使用 `ConfigService` 获取 JWT Secret。

### 7.2 多级缓存架构 (Multi-Layer Caching)

在 `S3Module` 中引入了基于 `Keyv` 的多级缓存机制，优化预签名 URL 的生成性能：

- **L1 (Memory)**: 本地内存缓存 (`cacheable-memory`)。
  - 配置: TTL 60s, LRU Size 5000。
  - 作用: 处理极高频的重复访问，减少 Redis IO。
- **L2 (Redis)**: 分布式 Redis 缓存 (`@keyv/redis`)。
  - 作用: 跨实例共享缓存，持久化。
  - **Namespace**: 使用 `read-comics-s3` 命名空间防止 Key 冲突。
