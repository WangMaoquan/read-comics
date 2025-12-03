# 角色权限系统使用指南

## 角色定义

系统包含三个固定角色：

1. **super_admin（超级管理员）**
   - 第一个注册的用户自动成为超级管理员
   - 拥有所有权限
   - 可以管理所有资源

2. **admin（管理员）**
   - 可以管理漫画、查看统计等
   - 无法管理用户和系统设置

3. **user（普通用户）**
   - 只能访问自己的数据
   - 可以阅读漫画、保存进度等

## 使用方法

### 1. 在控制器上应用权限控制

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('comics')
@UseGuards(JwtAuthGuard, RolesGuard) // 启用认证和角色检查
export class ComicsController {
  // 仅超级管理员可以访问
  @Post()
  @Roles('super_admin')
  create(@Body() createComicDto: CreateComicDto) {
    return this.comicsService.create(createComicDto);
  }

  // 管理员和超级管理员可以访问
  @Get('stats')
  @Roles('admin', 'super_admin')
  getStats() {
    return this.comicsService.getStats();
  }

  // 所有认证用户可以访问（不需要 @Roles 装饰器）
  @Get()
  findAll() {
    return this.comicsService.findAll();
  }
}
```

### 2. 常见使用场景

#### 场景1：管理员功能

```typescript
@Post('comics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super_admin')
@ApiOperation({ summary: '上传漫画（管理员及以上）' })
uploadComic(@Body() data: UploadComicDto) {
  return this.comicsService.upload(data);
}
```

#### 场景2：用户只能访问自己的数据

```typescript
@Get('progress')
@UseGuards(JwtAuthGuard)
@ApiOperation({ summary: '获取我的阅读进度' })
getMyProgress(@Request() req) {
  const userId = req.user.sub;
  return this.progressService.getByUser(userId);
}
```

#### 场景3：超级管理员独有功能

```typescript
@Post('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin')
@ApiOperation({ summary: '创建用户（仅超级管理员）' })
createUser(@Body() data: CreateUserDto) {
  return this.usersService.create(data);
}
```

## 权限分配建议

### 超级管理员 (super_admin)

- ✅ 用户管理（CRUD）
- ✅ 系统设置
- ✅ 所有漫画管理权限
- ✅ 所有统计和日志查看

### 管理员 (admin)

- ✅ 漫画上传和管理
- ✅ 查看统计信息
- ✅ 管理备份
- ❌ 用户管理
- ❌ 系统设置

### 普通用户 (user)

- ✅ 浏览漫画
- ✅ 阅读漫画
- ✅ 保存阅读进度
- ✅ 管理个人收藏
- ❌ 上传漫画
- ❌ 查看系统统计

## TOKEN 中的角色信息

JWT Payload 包含：

```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "username": "john_doe",
  "role": "super_admin"
}
```

在控制器中获取当前用户角色：

```typescript
@Get('check-role')
@UseGuards(JwtAuthGuard)
checkRole(@Request() req) {
  return {
    role: req.user.role,
    isAdmin: req.user.role === 'admin' || req.user.role === 'super_admin',
    isSuperAdmin: req.user.role === 'super_admin',
  };
}
```

## 注意事项

1. **第一个用户自动为超级管理员**
   - 系统检测到用户数为0时，将新注册用户设为 super_admin

2. **super_admin 拥有所有权限**
   - RolesGuard 会自动为 super_admin 放行所有请求

3. **Guard 顺序很重要**
   - 必须先使用 `JwtAuthGuard`，再使用 `RolesGuard`
   - `@UseGuards(JwtAuthGuard, RolesGuard)`

4. **可以组合多个角色**
   - `@Roles('admin', 'super_admin')` 表示这两个角色都可以访问
