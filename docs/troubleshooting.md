# 故障排查指南 (Troubleshooting Guide)

本文档记录开发过程中遇到的常见错误及其解决方案。

## 1. NestJS 依赖解析错误 (UnknownDependenciesException)

### 🔴 错误现象

启动后端服务 (`pnpm dev:backend`) 时，出现如下报错：

```
[ExceptionHandler] UnknownDependenciesException [Error]: Nest can't resolve dependencies of the ComicsService (ComicRepository, ReadingProgressRepository, ChaptersService, FavoritesService, DataSource, ?, FilesService). Please make sure that the argument ImagesService at index [5] is available in the ComicsModule context.

Potential solutions:
- Is ComicsModule a valid NestJS module?
- If ImagesService is a provider, is it part of the current ComicsModule?
...
```

### 🧐 原因分析

这个错误通常由以下两个原因共同导致：

1.  **缺少模块导入 (Missing Import)**:
    - 报错信息提示 `index [5]` (即构造函数第 6 个参数 `ImagesService`) 无法解析。
    - 这说明 `ComicsService` 依赖了 `ImagesService`，但 `ComicsModule` 没有导入包含该服务的 `ImagesModule`。

2.  **循环依赖 (Circular Dependency)**:
    - `ComicsModule` 引用了 `FilesModule`。
    - `FilesModule` 同时也引用了 `ComicsModule`。
    - 这种 A -> B -> A 的相互引用会导致 NestJS 在初始化时陷入死锁，无法解析对方的 Provider。

### ✅ 解决方案

#### 第一步：补全导入

在 `ComicsModule` 中导入缺失的 `ImagesModule`。

#### 第二步：解决循环依赖 (使用 `forwardRef`)

使用 NestJS 提供的 `forwardRef()` 函数来延迟解析循环依赖的模块。

**修改 `src/modules/comics/comics.module.ts`:**

```typescript
import { Module, forwardRef } from '@nestjs/common';
// ... 其他导入
import { ImagesModule } from '../images/images.module'; // [新增]
import { FilesModule } from '../files/files.module'; // [新增]

@Module({
  imports: [
    // ...
    ImagesModule, // [修复 1]: 导入 ImagesModule
    forwardRef(() => FilesModule), // [修复 2]: 使用 forwardRef 解决循环依赖
  ],
  // ...
})
export class ComicsModule {}
```

**修改 `src/modules/files/files.module.ts`:**

```typescript
import { Module, forwardRef } from '@nestjs/common';
// ...
import { ComicsModule } from '../comics/comics.module';

@Module({
  imports: [
    forwardRef(() => ComicsModule), // [修复 2]: 同样使用 forwardRef
    // ...
  ],
  // ...
})
export class FilesModule {}
```

### 📝 总结技巧

- **看报错位置**: `index [x]` 精确指出了是哪个依赖项出了问题。
- **检查 Provide/Export**: 确保被依赖的服务在它的 Module 中被 `providers` **并且** `exports` 了。
- **检查 Import**: 确保使用该服务的 Module 在 `imports` 中引入了源 Module。
- **警惕循环**: 如果两个模块相互需要，必须双方都用 `forwardRef`。
