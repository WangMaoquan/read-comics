# API 权限接口文档

## 目录

- [认证说明](#认证说明)
- [角色说明](#角色说明)
- [认证接口](#认证接口-auth)
- [用户管理](#用户管理-users)
- [漫画管理](#漫画管理-comics)
- [文件管理](#文件管理-files)
- [统计数据](#统计数据-stats)
- [备份管理](#备份管理-backups)
- [系统日志](#系统日志-system-logs)

---

## 认证说明

### Bearer Token 认证

所有需要认证的接口都使用 JWT Bearer Token：

```http
Authorization: Bearer <your-jwt-token>
```

### 获取 Token

通过 [登录接口](#登录) 或 [注册接口](#注册) 获取 token。

---

## 角色说明

| 角色       | 代码          | 说明                                           |
| ---------- | ------------- | ---------------------------------------------- |
| 超级管理员 | `super_admin` | 拥有所有权限，第一个注册用户自动成为超级管理员 |
| 管理员     | `admin`       | 可管理漫画、查看统计、管理备份                 |
| 普通用户   | `user`        | 只能浏览漫画、保存阅读进度                     |

---

## 认证接口 (Auth)

### 注册

**POST** `/api/auth/register`

创建新用户账户。第一个注册的用户自动成为超级管理员。

**权限**：🌍 公开（无需认证）

**请求体**：

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**响应**：

```json
{
  "user": {
    "id": "uuid",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**字段说明**：

- `username`: 用户名，最小长度3
- `email`: 邮箱，必须为有效邮箱格式
- `password`: 密码，最小长度6

---

### 登录

**POST** `/api/auth/login`

用户登录获取访问令牌。

**权限**：🌍 公开（无需认证）

**请求体**：

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**响应**：

```json
{
  "user": {
    "id": "uuid",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 获取当前用户信息

**GET** `/api/auth/me`

获取当前登录用户的信息。

**权限**：🔐 需要登录

**Headers**：

```http
Authorization: Bearer <token>
```

**响应**：

```json
{
  "id": "uuid",
  "username": "john_doe",
  "email": "john@example.com",
  "role": "user"
}
```

---

## 用户管理 (Users)

### 创建用户

**POST** `/api/users`

创建新用户（仅超级管理员）。

**权限**：👑 `super_admin`

**Headers**：

```http
Authorization: Bearer <token>
```

**请求体**：

```json
{
  "username": "new_user",
  "email": "newuser@example.com",
  "password": "password123",
  "role": "user"
}
```

---

### 获取所有用户

**GET** `/api/users`

获取用户列表（管理员及以上）。

**权限**：🔑 `admin`, `super_admin`

**Headers**：

```http
Authorization: Bearer <token>
```

**响应**：

```json
[
  {
    "id": "uuid",
    "username": "user1",
    "email": "user1@example.com",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### 获取用户详情

**GET** `/api/users/:id`

获取指定用户的详细信息。

**权限**：🔐 需要登录

**Headers**：

```http
Authorization: Bearer <token>
```

**响应**：

```json
{
  "id": "uuid",
  "username": "john_doe",
  "email": "john@example.com",
  "role": "user",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

### 更新用户

**PATCH** `/api/users/:id`

更新用户信息（仅超级管理员）。

**权限**：👑 `super_admin`

**Headers**：

```http
Authorization: Bearer <token>
```

**请求体**：

```json
{
  "username": "new_username",
  "email": "newemail@example.com",
  "role": "admin"
}
```

---

### 删除用户

**DELETE** `/api/users/:id`

删除用户（仅超级管理员）。

**权限**：👑 `super_admin`

**Headers**：

```http
Authorization: Bearer <token>
```

---

## 漫画管理 (Comics)

### 获取漫画列表

**GET** `/api/comics`

获取所有漫画列表，支持分页和搜索。

**权限**：🌍 公开（无需认证）

**查询参数**：

- `page`: 页码（可选）
- `limit`: 每页数量（可选）
- `keyword`: 搜索关键词（可选）

**示例**：

```http
GET /api/comics?page=1&limit=20&keyword=火影
```

**响应**：

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "火影忍者",
      "author": "岸本齐史",
      "totalPages": 720,
      "fileFormat": "cbz",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

---

### 获取漫画详情

**GET** `/api/comics/:id`

获取指定漫画的详细信息。

**权限**：🌍 公开（无需认证）

**响应**：

```json
{
  "id": "uuid",
  "title": "火影忍者",
  "author": "岸本齐史",
  "description": "描述...",
  "totalPages": 720,
  "fileFormat": "cbz",
  "fileSize": 104857600,
  "chapters": [
    {
      "id": "uuid",
      "title": "第1话",
      "pageNumber": 1
    }
  ],
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

### 创建漫画

**POST** `/api/comics`

创建新漫画记录（管理员及以上）。

**权限**：🔑 `admin`, `super_admin`

**Headers**：

```http
Authorization: Bearer <token>
```

**请求体**：

```json
{
  "title": "新漫画",
  "author": "作者名",
  "description": "描述",
  "filePath": "/path/to/file.cbz",
  "fileFormat": "cbz",
  "fileSize": 104857600,
  "totalPages": 200
}
```

---

### 更新漫画

**PATCH** `/api/comics/:id`

更新漫画信息（管理员及以上）。

**权限**：🔑 `admin`, `super_admin`

**Headers**：

```http
Authorization: Bearer <token>
```

**请求体**：

```json
{
  "title": "更新后的标题",
  "author": "新作者",
  "description": "新描述"
}
```

---

### 删除漫画

**DELETE** `/api/comics/:id`

删除漫画（管理员及以上）。

**权限**：🔑 `admin`, `super_admin`

**Headers**：

```http
Authorization: Bearer <token>
```

---

### 更新阅读进度

**POST** `/api/comics/:id/progress`

保存用户的阅读进度（需要登录）。

**权限**：🔐 需要登录

**Headers**：

```http
Authorization: Bearer <token>
```

**请求体**：

```json
{
  "chapterId": "chapter-uuid",
  "currentPage": 15,
  "totalPages": 50
}
```

**响应**：

```json
{
  "id": "progress-uuid",
  "comicId": "comic-uuid",
  "chapterId": "chapter-uuid",
  "currentPage": 15,
  "totalPages": 50,
  "progress": 30,
  "lastReadAt": "2024-01-01T00:00:00.000Z"
}
```

---

### 获取阅读进度

**GET** `/api/comics/:id/progress`

获取用户在该漫画的阅读进度（需要登录）。

**权限**：🔐 需要登录

**Headers**：

```http
Authorization: Bearer <token>
```

**响应**：

```json
{
  "comicId": "comic-uuid",
  "chapterId": "chapter-uuid",
  "currentPage": 15,
  "totalPages": 50,
  "progress": 30,
  "lastReadAt": "2024-01-01T00:00:00.000Z"
}
```

---

## 文件管理 (Files)

### 上传漫画文件

**POST** `/api/files/upload`

上传漫画文件（ZIP/CBZ格式）（管理员及以上）。

**权限**：🔑 `admin`, `super_admin`

**Headers**：

```http
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**请求体**（multipart/form-data）：

- `file`: 漫画文件（ZIP/CBZ格式）

**响应**：

```json
{
  "success": true,
  "message": "文件上传并导入成功",
  "data": {
    "filename": "manga-1234567890.cbz",
    "originalname": "火影忍者.cbz",
    "size": 104857600,
    "path": "./comics/manga-1234567890.cbz",
    "comic": {
      "id": "uuid",
      "title": "火影忍者",
      "chaptersCount": 50
    }
  }
}
```

---

### 扫描漫画目录

**GET** `/api/files/scan`

扫描服务器漫画目录（管理员及以上）。

**权限**：🔑 `admin`, `super_admin`

**Headers**：

```http
Authorization: Bearer <token>
```

**响应**：

```json
{
  "success": true,
  "count": 15,
  "files": [
    {
      "name": "manga1.cbz",
      "size": 104857600,
      "path": "./comics/manga1.cbz"
    }
  ]
}
```

---

### 删除文件

**DELETE** `/api/files/:filePath`

删除服务器上的文件（管理员及以上）。

**权限**：🔑 `admin`, `super_admin`

**Headers**：

```http
Authorization: Bearer <token>
```

---

### 获取支持格式

**GET** `/api/files/formats`

获取支持的漫画文件格式。

**权限**：🌍 公开（无需认证）

**响应**：

```json
{
  "success": true,
  "formats": [
    {
      "extension": ".cbz",
      "format": "CBZ",
      "description": "Comic Book ZIP format"
    },
    {
      "extension": ".zip",
      "format": "CBZ",
      "description": "ZIP archive format"
    }
  ]
}
```

---

## 统计数据 (Stats)

**所有统计接口权限**：🔑 `admin`, `super_admin`

**通用 Headers**：

```http
Authorization: Bearer <token>
```

### 获取总览统计

**GET** `/api/stats/overview`

获取系统总览统计数据。

**响应**：

```json
{
  "totalComics": 150,
  "totalChapters": 5000,
  "totalUsers": 200,
  "totalReadingProgress": 1500,
  "storageUsed": "10.5 GB",
  "averageRating": 4.5
}
```

---

### 获取漫画趋势

**GET** `/api/stats/comics-trend`

获取漫画增长趋势数据。

**查询参数**：

- `startDate`: 开始日期（可选）
- `endDate`: 结束日期（可选）
- `granularity`: 粒度 (day/week/month)（可选）

**示例**：

```http
GET /api/stats/comics-trend?granularity=month
```

**响应**：

```json
{
  "data": [
    {
      "date": "2024-01",
      "count": 10
    },
    {
      "date": "2024-02",
      "count": 15
    }
  ]
}
```

---

### 获取热门漫画

**GET** `/api/stats/top-comics`

获取阅读量最高的漫画。

**查询参数**：

- `limit`: 返回数量（可选，默认10）

**响应**：

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "火影忍者",
      "readCount": 1500,
      "coverPath": "/covers/naruto.jpg"
    }
  ]
}
```

---

### 获取存储统计

**GET** `/api/stats/storage`

获取存储空间使用情况。

**响应**：

```json
{
  "totalSize": 107374182400,
  "usedSize": 53687091200,
  "freeSize": 53687091200,
  "usagePercentage": 50
}
```

---

### 获取用户活跃度

**GET** `/api/stats/user-activity`

获取用户活跃度统计。

**查询参数**：

- `startDate`: 开始日期（可选）
- `endDate`: 结束日期（可选）

**响应**：

```json
{
  "data": [
    {
      "date": "2024-01-01",
      "activeUsers": 50
    }
  ]
}
```

---

## 备份管理 (Backups)

**所有备份接口权限**：🔑 `admin`, `super_admin`

**通用 Headers**：

```http
Authorization: Bearer <token>
```

### 创建备份

**POST** `/api/backups`

创建系统备份。

**请求体**：

```json
{
  "name": "备份-20240101",
  "description": "定期备份"
}
```

**响应**：

```json
{
  "id": "uuid",
  "name": "备份-20240101",
  "description": "定期备份",
  "size": 1073741824,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

### 获取备份列表

**GET** `/api/backups`

获取所有备份列表。

**响应**：

```json
[
  {
    "id": "uuid",
    "name": "备份-20240101",
    "size": 1073741824,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### 获取备份详情

**GET** `/api/backups/:id`

获取指定备份的详细信息。

---

### 获取备份统计

**GET** `/api/backups/stats`

获取备份统计信息。

**响应**：

```json
{
  "totalBackups": 10,
  "totalSize": 10737418240,
  "oldestBackup": "2023-01-01T00:00:00.000Z",
  "newestBackup": "2024-01-01T00:00:00.000Z"
}
```

---

### 删除备份

**DELETE** `/api/backups/:id`

删除指定备份。

---

## 系统日志 (System Logs)

**所有日志接口权限**：👑 `super_admin`（仅超级管理员）

**通用 Headers**：

```http
Authorization: Bearer <token>
```

### 获取日志列表

**GET** `/api/logs`

获取系统日志列表。

**查询参数**：

- `page`: 页码（可选）
- `limit`: 每页数量（可选）
- `level`: 日志级别（可选）
- `startDate`: 开始日期（可选）
- `endDate`: 结束日期（可选）

**响应**：

```json
{
  "data": [
    {
      "id": "uuid",
      "level": "info",
      "message": "用户登录成功",
      "timestamp": "2024-01-01T00:00:00.000Z",
      "userId": "user-uuid"
    }
  ],
  "total": 1000,
  "page": 1,
  "limit": 50
}
```

---

### 获取日志统计

**GET** `/api/logs/stats`

获取日志统计信息。

**响应**：

```json
{
  "totalLogs": 10000,
  "errorCount": 50,
  "warningCount": 200,
  "infoCount": 9750
}
```

---

### 清空所有日志

**DELETE** `/api/logs`

清空所有系统日志（谨慎操作）。

---

## 状态码说明

| 状态码 | 说明               |
| ------ | ------------------ |
| 200    | 请求成功           |
| 201    | 创建成功           |
| 400    | 请求参数错误       |
| 401    | 未认证（需要登录） |
| 403    | 权限不足           |
| 404    | 资源不存在         |
| 500    | 服务器错误         |

---

## 错误响应格式

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "未授权访问"
}
```

或

```json
{
  "statusCode": 403,
  "message": "Forbidden",
  "error": "权限不足"
}
```

---

## 图例说明

- 🌍 公开接口（无需认证）
- 🔐 需要登录（任何已登录用户）
- 🔑 管理员及以上（`admin`, `super_admin`）
- 👑 仅超级管理员（`super_admin`）

---

## 使用示例

### cURL 示例

**注册用户**：

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

**登录**：

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**获取漫画列表（需要 token）**：

```bash
curl -X GET http://localhost:3000/api/comics \
  -H "Authorization: Bearer <your-token>"
```

---

## Swagger 文档

访问 `http://localhost:3000/api` 查看自动生成的交互式 API 文档。

在 Swagger UI 中：

1. 点击右上角 **Authorize** 按钮
2. 输入 `Bearer <your-token>`
3. 点击 **Authorize** 确认
4. 现在可以直接在 Swagger UI 中测试需要认证的接口

---

**文档版本**：v1.0  
**最后更新**：2024-11-30
