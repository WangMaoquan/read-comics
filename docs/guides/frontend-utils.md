# Frontend 工具函数文档

本文档介绍 frontend 项目中的工具函数和系统组件。

## 📁 目录结构

```
src/
├── utils/              # 工具函数
│   ├── format.ts       # 格式化工具
│   ├── logger.ts       # 日志管理
│   ├── errorHandler.ts # 错误处理
│   ├── apiCache.ts     # API 缓存
│   ├── performance.ts  # 性能监控
│   ├── toast.ts        # Toast 通知服务
│   └── formatValidation.ts # 文件验证
├── composables/        # 组合式函数
│   ├── useToast.ts     # Toast 通知
│   └── useImageUrl.ts  # 图片 URL 处理
├── config/             # 配置文件
│   └── index.ts        # 应用配置
└── components/         # 组件
    ├── Toast.vue       # Toast 组件
    └── Alert.vue       # 内联提示组件
```

## 🛠️ 工具函数

### 1. 格式化工具 (`utils/format.ts`)

提供常用的格式化函数:

```typescript
import {
  formatFileSize,
  formatDate,
  formatRelativeTime,
  truncateText,
  debounce,
  throttle,
} from '@/utils/format';

// 格式化文件大小
formatFileSize(1024 * 1024); // "1 MB"

// 格式化日期
formatDate(new Date()); // "2025年12月2日"

// 相对时间
formatRelativeTime(new Date(Date.now() - 3600000)); // "1小时前"

// 截断文本
truncateText('很长的文本...', 10); // "很长的文本..."

// 防抖
const debouncedFn = debounce(() => console.log('执行'), 300);

// 节流
const throttledFn = throttle(() => console.log('执行'), 1000);
```

### 2. 日志管理 (`utils/logger.ts`)

统一的日志管理系统:

```typescript
import { logger } from '@/utils/logger';

// 不同级别的日志
logger.debug('调试信息', { data: 'some data' });
logger.info('普通信息');
logger.warn('警告信息');
logger.error('错误信息', error);

// 获取日志
const logs = logger.getLogs();

// 导出日志
const logsJson = logger.export();

// 清空日志
logger.clear();
```

**特性:**

- ✅ 开发环境输出到控制台
- ✅ 生产环境静默(可配置发送到日志服务)
- ✅ 自动捕获全局错误
- ✅ 日志持久化(最多 1000 条)
- ✅ 支持导出日志

### 3. 错误处理 (`utils/errorHandler.ts`)

统一的错误处理系统:

```typescript
import {
  handleError,
  ErrorHandler,
  AppError,
  ErrorType,
} from '@/utils/errorHandler';

// 简单使用
try {
  await someAsyncOperation();
} catch (error) {
  handleError(error); // 自动显示 Toast 并记录日志
}

// 自定义错误消息
try {
  await someAsyncOperation();
} catch (error) {
  handleError(error, '操作失败,请重试');
}

// 不显示 Toast
try {
  await someAsyncOperation();
} catch (error) {
  handleError(error, undefined, { showToast: false });
}

// 创建自定义错误
throw new AppError('自定义错误', ErrorType.VALIDATION, {
  code: 'INVALID_INPUT',
  data: { field: 'email' },
});
```

**错误类型:**

- `NETWORK` - 网络错误
- `AUTH` - 认证错误
- `VALIDATION` - 验证错误
- `NOT_FOUND` - 资源不存在
- `SERVER` - 服务器错误
- `UNKNOWN` - 未知错误

### 4. API 缓存 (`utils/apiCache.ts`)

智能 API 响应缓存:

```typescript
import { apiCache } from '@/utils/apiCache';

// 设置缓存
apiCache.set('/comics', data, { page: 1 }, 5 * 60 * 1000); // 缓存 5 分钟

// 获取缓存
const cachedData = apiCache.get('/comics', { page: 1 });

// 检查缓存
if (apiCache.has('/comics', { page: 1 })) {
  // 使用缓存
}

// 删除缓存
apiCache.delete('/comics', { page: 1 });

// 清空所有缓存
apiCache.clear();

// 获取统计信息
const stats = apiCache.getStats();
```

**特性:**

- ✅ 自动过期管理
- ✅ LRU 淘汰策略
- ✅ 定期清理过期缓存
- ✅ 支持自定义 TTL
- ✅ 缓存统计信息

### 5. 性能监控 (`utils/performance.ts`)

性能监控和分析:

```typescript
import { performanceMonitor } from '@/utils/performance';

// 手动计时
performanceMonitor.start('loadComics');
await loadComics();
performanceMonitor.end('loadComics');

// 自动测量
const result = await performanceMonitor.measure(
  'loadComics',
  async () => {
    return await loadComics();
  },
  { page: 1 },
);

// 获取统计
const stats = performanceMonitor.getStats('loadComics');
console.log(stats); // { count, average, min, max, total }

// 导出性能数据
const perfData = performanceMonitor.export();
```

**特性:**

- ✅ 自动记录耗时
- ✅ 慢操作警告(>1s)
- ✅ 统计分析
- ✅ 页面加载性能监控
- ✅ 开发环境实时输出

## 🎨 组合式函数

### 1. Toast 通知 (`composables/useToast.ts`)

```typescript
import { toast } from '@/composables/useToast';

// 不同类型的通知
toast.success('操作成功!');
toast.error('操作失败');
toast.warning('请注意');
toast.info('提示信息');

// 自定义持续时间
toast.success('消息', 5000); // 5 秒后消失
```

### 2. 图片 URL (`composables/useImageUrl.ts`)

```typescript
import { useImageUrl } from '@/composables/useImageUrl';

const { getThumbnailUrl, getImageUrl, getCoverUrl, handleImageError } = useImageUrl();

// 获取缩略图
const thumbUrl = getThumbnailUrl(comicPath, imagePath);

// 获取完整图片
const fullUrl = getImageUrl(comicPath, imagePath);

// 获取封面
const coverUrl = getCoverUrl(comicPath, coverPath);

// 错误处理
<img :src="coverUrl" @error="(e) => handleImageError(e)" />
```

## ⚙️ 配置

### 环境变量 (`.env`)

```bash
# API 配置
VITE_API_BASE_URL=http://localhost:4399
VITE_IMAGE_BASE_URL=http://localhost:4399

# 应用配置
VITE_APP_NAME=漫画阅读器
VITE_APP_VERSION=1.0.0

# 调试模式
VITE_DEBUG=false
```

### 应用配置 (`config/index.ts`)

```typescript
import { API_BASE_URL, TOAST_DURATION, STORAGE_KEYS } from '@/config';

// 使用配置
const apiUrl = API_BASE_URL;
const toastDuration = TOAST_DURATION.success;
const tokenKey = STORAGE_KEYS.AUTH_TOKEN;
```

## 📦 组件

### Toast 组件

自动集成到 `Layout.vue`,无需手动添加。

### Alert 组件

内联提示组件:

```vue
<Alert message="操作成功" type="success" />
<Alert message="发生错误" type="error" />
<Alert message="请注意" type="warning" />
<Alert message="提示信息" type="info" />
```

## 🎯 最佳实践

### 1. 错误处理

```typescript
// ❌ 不好的做法
try {
  await api.get('/comics');
} catch (error) {
  console.error(error);
  alert('加载失败');
}

// ✅ 好的做法
try {
  await api.get('/comics');
} catch (error) {
  handleError(error, '加载漫画失败');
}
```

### 2. 日志记录

```typescript
// ❌ 不好的做法
console.log('Loading comics...');
console.error('Failed:', error);

// ✅ 好的做法
logger.info('Loading comics...');
logger.error('Failed to load comics', error);
```

### 3. 性能监控

```typescript
// ✅ 监控关键操作
const loadComics = async () => {
  return performanceMonitor.measure('loadComics', async () => {
    return await comicsService.getAll();
  });
};
```

### 4. API 缓存

```typescript
// ✅ 使用缓存减少请求
const getComics = async (page: number) => {
  const cached = apiCache.get('/comics', { page });
  if (cached) return cached;

  const data = await comicsService.getAll({ page });
  apiCache.set('/comics', data, { page });
  return data;
};
```

## 📊 性能优化建议

1. **使用缓存**: 对不常变化的数据使用 API 缓存
2. **监控性能**: 使用性能监控找出瓶颈
3. **错误处理**: 统一使用错误处理系统
4. **日志管理**: 使用日志系统而不是 console
5. **防抖节流**: 对频繁操作使用防抖或节流

## 🔧 调试技巧

### 查看日志

```typescript
// 在浏览器控制台
window.__logger__ = logger;
window.__logger__.getLogs();
```

### 查看性能数据

```typescript
// 在浏览器控制台
window.__perf__ = performanceMonitor;
window.__perf__.getStats();
```

### 查看缓存

```typescript
// 在浏览器控制台
window.__cache__ = apiCache;
window.__cache__.getStats();
```

## 📝 更新日志

### v1.1.0 (2025-12-02)

- ✅ 添加日志管理系统
- ✅ 添加错误处理系统
- ✅ 添加 API 缓存系统
- ✅ 添加性能监控系统
- ✅ 添加格式化工具函数
- ✅ 添加 Toast 通知系统
- ✅ 统一配置管理

### v1.0.0 (2025-11-30)

- 🎉 初始版本发布
