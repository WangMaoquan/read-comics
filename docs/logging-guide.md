# 后端日志功能使用指南

## 概述

后端项目已增强日志功能,在开发环境下会在控制台打印详细的接口调用信息,方便调试和维护。

## 功能特性

### ✨ 主要功能

1. **彩色控制台输出** - 不同的 HTTP 方法和状态码使用不同颜色
2. **详细的请求信息** - 包括查询参数、路由参数、请求体等
3. **响应信息打印** - 包括状态码、响应时间、响应数据
4. **性能监控** - 自动计算并显示请求耗时
5. **敏感信息脱敏** - 自动隐藏密码、token 等敏感字段
6. **用户信息追踪** - 显示当前请求的用户信息
7. **错误日志** - 详细的错误信息和堆栈跟踪
8. **数据库日志** - 修改性操作会记录到数据库

### 🎨 日志格式示例

#### 请求日志

```
================================================================================
📥 [2025-12-22 10:43:53] GET /comics
👤 User: admin (uuid-123) [super_admin]
🌐 IP: ::1
🔍 Query: {
  "page": "1",
  "pageSize": "20"
}
🖥️  Client: Chrome
```

#### 响应日志

```
📤 Response: GET /comics
   Status: 200 | Duration: 45ms
   📄 Response Data: {"data":[...],"total":100}
================================================================================
```

#### 错误日志

```
❌ Error: POST /comics
   Duration: 123ms
   🚨 Error: Validation failed
   📚 Stack: Error: Validation failed
       at ComicsController.create
       at ...
================================================================================
```

## 配置说明

### 日志配置文件

配置文件位置: `src/common/config/logging.config.ts`

### 可配置项

```typescript
export const LoggingConfig = {
  // 是否启用详细的控制台日志 (生产环境自动禁用)
  enableDetailedLogs: process.env.NODE_ENV !== 'production',

  // 是否打印请求体
  logRequestBody: true,

  // 是否打印响应体
  logResponseBody: true,

  // 响应体最大打印长度(字符)
  maxResponseBodyLength: 500,

  // 是否打印查询参数
  logQueryParams: true,

  // 是否打印路由参数
  logRouteParams: true,

  // 是否打印用户信息
  logUserInfo: true,

  // 是否打印 IP 地址
  logIpAddress: true,

  // 是否打印 User Agent
  logUserAgent: true,

  // 需要脱敏的字段名称
  sensitiveFields: [
    'password',
    'token',
    'secret',
    'apiKey',
    'accessToken',
    'refreshToken',
    'secretKey',
  ],

  // 需要忽略日志的路径(正则表达式)
  ignoredPaths: [/\/health$/, /\/favicon\.ico$/, /\/api\/docs/],

  // 慢请求阈值(毫秒)
  slowRequestThreshold: 500,

  // 是否在数据库中记录日志
  enableDatabaseLogs: true,
};
```

## 颜色说明

### HTTP 方法颜色

- 🟢 **GET** - 绿色
- 🟡 **POST** - 黄色
- 🔵 **PUT** - 蓝色
- 🟣 **PATCH** - 紫色
- 🔴 **DELETE** - 红色

### 状态码颜色

- 🟢 **2xx** - 绿色 (成功)
- 🔵 **3xx** - 青色 (重定向)
- 🟡 **4xx** - 黄色 (客户端错误)
- 🔴 **5xx** - 红色 (服务器错误)

### 耗时颜色

- 🟢 **< 100ms** - 绿色 (快)
- 🟡 **100-500ms** - 黄色 (中等)
- 🔴 **> 500ms** - 红色 (慢)

## 使用场景

### 1. 开发调试

在开发环境下,所有接口调用都会打印详细日志,方便:

- 查看请求参数是否正确
- 检查响应数据格式
- 监控接口性能
- 追踪错误原因

### 2. 性能优化

通过日志中的耗时信息,可以:

- 识别慢接口
- 优化数据库查询
- 改进业务逻辑

### 3. 问题排查

当出现问题时,可以通过日志:

- 查看完整的请求信息
- 追踪用户操作
- 分析错误堆栈

### 4. 安全审计

数据库日志记录了所有修改性操作:

- 谁在什么时间
- 对什么资源
- 执行了什么操作

## 环境配置

### 开发环境

默认启用详细日志,所有请求都会打印到控制台。

### 生产环境

设置 `NODE_ENV=production` 后:

- 控制台详细日志自动禁用
- 只记录修改性操作到数据库
- 减少性能开销

### 自定义配置

如果需要在生产环境启用详细日志,可以修改配置文件:

```typescript
// src/common/config/logging.config.ts
export const LoggingConfig = {
  enableDetailedLogs: true, // 强制启用
  // ... 其他配置
};
```

## 忽略特定路径

如果某些路径不需要打印日志,可以在配置中添加:

```typescript
ignoredPaths: [
  /\/health$/,           // 健康检查
  /\/favicon\.ico$/,     // 图标请求
  /\/api\/docs/,         // API 文档
  /\/metrics$/,          // 监控指标
],
```

## 添加自定义敏感字段

如果有其他敏感字段需要脱敏,可以添加到配置中:

```typescript
sensitiveFields: [
  'password',
  'token',
  'secret',
  'apiKey',
  'accessToken',
  'refreshToken',
  'secretKey',
  'creditCard',      // 添加信用卡
  'ssn',             // 添加社保号
  // ... 其他敏感字段
],
```

## 数据库日志查询

修改性操作会记录到 `system_logs` 表,可以通过以下方式查询:

### 通过 API

```
GET /system-logs?page=1&pageSize=20&level=info&module=comics
```

### 通过 Admin 面板

访问 Admin 面板的"系统日志"页面查看。

### 直接查询数据库

```sql
SELECT * FROM system_logs
WHERE module = 'comics'
ORDER BY created_at DESC
LIMIT 20;
```

## 注意事项

1. **性能影响**: 详细日志会增加一定的性能开销,建议只在开发环境启用
2. **敏感信息**: 虽然有脱敏处理,但仍需注意不要在日志中打印敏感信息
3. **日志大小**: 如果响应数据很大,会自动截断,只显示长度信息
4. **数据库清理**: 建议定期清理 `system_logs` 表,避免数据过多

## 示例输出

启动服务后,你会看到类似这样的输出:

```
================================================================================
🚀 漫画阅读器后端服务启动成功!
================================================================================
📅 启动时间: 2025-12-22 10:43:53
🌍 运行环境: development
📡 服务地址: http://localhost:3000
📚 API 文档: http://localhost:3000/api/docs
📊 健康检查: http://localhost:3000/health

📋 配置信息:
   - 数据库: localhost:3306
   - Redis: ✅ 已配置
   - S3 存储: ✅ 已配置
   - 邮件服务: ✅ 已配置
   - 详细日志: ✅ 已启用
================================================================================
```

当有请求时:

```
================================================================================
📥 [2025-12-22 10:45:23] POST /comics
👤 User: admin (550e8400-e29b-41d4-a716-446655440000) [super_admin]
🌐 IP: ::1
📦 Body: {
  "title": "测试漫画",
  "author": "测试作者",
  "description": "这是一个测试"
}
🖥️  Client: Postman

📤 Response: POST /comics
   Status: 201 | Duration: 156ms
   📄 Response Data: {"id":"123","title":"测试漫画",...}
================================================================================
```

## 故障排除

### 日志没有显示

1. 检查 `NODE_ENV` 环境变量
2. 检查 `LoggingConfig.enableDetailedLogs` 配置
3. 检查请求路径是否在 `ignoredPaths` 中

### 敏感信息没有脱敏

1. 检查字段名是否在 `sensitiveFields` 列表中
2. 字段名是否完全匹配(区分大小写)

### 数据库日志没有记录

1. 检查 `LoggingConfig.enableDatabaseLogs` 配置
2. 检查是否是修改性操作(POST/PUT/PATCH/DELETE)
3. 检查数据库连接是否正常
