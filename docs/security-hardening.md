# 安全加固说明文档 (Security Hardening Documentation)

本文档详细说明了已在 `read-comics` 后端实施的安全加固措施，旨在预防常见的 Web 漏洞并保障系统稳定性。

---

## 1. 基础安全防御 (Basic Defense)

### 1.1 HTTP 安全头 (Helmet)

在系统入口点 (`main.ts`) 集成了 `helmet` 中间件，自动设置了一系列安全响应头：

- **X-Content-Type-Options**: 防止浏览器进行 MIME 类型嗅探。
- **X-Frame-Options**: 防止点击劫持 (Clickjacking)。
- **X-XSS-Protection**: 启用浏览器内置的 XSS 过滤。
- **Strict-Transport-Security**: 强制使用 HTTPS（需配合 SSL 证书）。
- **Cross-Origin Resource Policy**: 配置为允许跨域加载图片资产。

### 1.2 全局速率限制 (Rate Limiting)

集成了 `@nestjs/throttler`，对恶意请求和 CC 攻击进行拦截：

- **默认配置**: 每个 IP 每 1 分钟内最多允许 100 次请求。
- **作用范围**: 应用于所有 API 接口，保护系统资源不被滥用。

---

## 2. 账号安全 (Account Security)

### 2.1 登录防爆破 (Brute-force Protection)

在 `AuthService` 中实现了登录失败锁定机制：

- **失败记录**: 使用 `CacheManager` 记录连续登录失败次数，有效期 1 小时。
- **锁定规则**: 1 分钟内连续失败 5 次，该账号将被 **锁定 15 分钟**。
- **安全提示**: 统一返回“邮箱或密码错误”，不在错误信息中区分“用户不存在”或“密码错误”，以防邮箱探测。

---

## 3. 文件系统安全 (File System Security)

### 3.1 路径穿越防御 (Path Traversal Protection)

创建并应用了 `PathUtils.safeJoin` 工具类，严格校验所有文件操作路径：

- **安全校验**: 强制所有请求操作必须限定在 `COMICS_PATH` 根目录下。
- **行为**:
  - 解析并规范化所有相对路径。
  - 检查解析后的路径是否以根目录开头。
  - 发现包含 `../` 或试图跳出根目录的非法路径时，立即抛出 `ForbiddenException`。
- **应用位置**: `FilesService`（文件信息/删除）、`ImagesService`（直接提取图片）。

---

## 4. 未来改进建议

- **精细化 CSP 策略**: 目前内容安全策略 (CSP) 处于关闭状态以保持开发兼容性，生产环境下可配置精细的白名单。
- **图片防盗链**: 进一步通过 `Referer` 校验或签名 URL 保护漫画图片不被外站非法嵌入。
