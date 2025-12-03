# Admin 后端模块实施指南

## 概述

本文档详细说明如何为 Admin 前端实现对应的后端模块。

---

## 已完成的模块

### ✅ 1. Stats 模块 (统计数据)

**位置**: `apps/backend/src/modules/stats/`

**文件结构**:

```
stats/
├── dto/
│   └── get-stats-query.dto.ts
├── stats.controller.ts
├── stats.service.ts
└── stats.module.ts
```

**API 端点**:

- `GET /stats/overview` - 总览统计
- `GET /stats/comics-trend` - 漫画趋势
- `GET /stats/top-comics` - 热门漫画
- `GET /stats/storage` - 存储统计
- `GET /stats/user-activity` - 用户活跃度

**使用的 Entity**:

- Comic
- User

---

## 待实施的模块

### 🔨 2. Logs 模块 (系统日志)

**实施步骤**:

#### 2.1 创建目录结构

```bash
mkdir -p apps/backend/src/modules/logs/dto
```

#### 2.2 创建 Entity

文件: `apps/backend/src/entities/system-log.entity.ts` (已创建)

#### 2.3 创建 DTO

文件: `apps/backend/src/modules/logs/dto/query-logs.dto.ts`

```typescript
import { IsString, IsOptional, IsIn, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class QueryLogsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, enum: ['info', 'warn', 'error', 'debug'] })
  @IsOptional()
  @IsIn(['info', 'warn', 'error', 'debug'])
  level?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  module?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  page?: number;

  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  pageSize?: number;
}
```

#### 2.4 创建 Service

文件: `apps/backend/src/modules/logs/logs.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, In } from 'typeorm';
import { SystemLog } from '../../entities/system-log.entity';
import { QueryLogsDto } from './dto/query-logs.dto';

@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(SystemLog)
    private logsRepository: Repository<SystemLog>,
  ) {}

  async create(logData: Partial<SystemLog>): Promise<SystemLog> {
    const log = this.logsRepository.create(logData);
    return this.logsRepository.save(log);
  }

  async findAll(query: QueryLogsDto) {
    const {
      search,
      level,
      module,
      startDate,
      endDate,
      page = 1,
      pageSize = 10,
    } = query;
    const where: any = {};

    if (level) where.level = level;
    if (module) where.module = module;
    if (search) {
      where.message = Like(`%${search}%`);
    }
    if (startDate && endDate) {
      where.createdAt = Between(new Date(startDate), new Date(endDate));
    }

    const [data, total] = await this.logsRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getStats() {
    const total = await this.logsRepository.count();
    const info = await this.logsRepository.count({ where: { level: 'info' } });
    const warn = await this.logsRepository.count({ where: { level: 'warn' } });
    const error = await this.logsRepository.count({
      where: { level: 'error' },
    });
    const debug = await this.logsRepository.count({
      where: { level: 'debug' },
    });

    return { total, info, warn, error, debug };
  }

  async clearAll(): Promise<void> {
    await this.logsRepository.clear();
  }
}
```

#### 2.5 创建 Controller

文件: `apps/backend/src/modules/logs/logs.controller.ts`

```typescript
import { Controller, Get, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { LogsService } from './logs.service';
import { QueryLogsDto } from './dto/query-logs.dto';

@ApiTags('logs')
@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  @ApiOperation({ summary: '获取日志列表' })
  @ApiResponse({ status: 200, description: '成功获取日志' })
  findAll(@Query() query: QueryLogsDto) {
    return this.logsService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: '获取日志统计' })
  @ApiResponse({ status: 200, description: '成功获取统计' })
  getStats() {
    return this.logsService.getStats();
  }

  @Delete()
  @ApiOperation({ summary: '清空所有日志' })
  @ApiResponse({ status: 200, description: '清空成功' })
  clearAll() {
    return this.logsService.clearAll();
  }
}
```

#### 2.6 创建 Module

文件: `apps/backend/src/modules/logs/logs.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogsController } from './logs.controller';
import { LogsService } from './logs.service';
import { SystemLog } from '../../entities/system-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SystemLog])],
  controllers: [LogsController],
  providers: [LogsService],
  exports: [LogsService],
})
export class LogsModule {}
```

#### 2.7 注册到 AppModule

文件: `apps/backend/src/app.module.ts`

```typescript
import { LogsModule } from './modules/logs/logs.module';

@Module({
  imports: [
    // ... 其他模块
    LogsModule,
  ],
})
export class AppModule {}
```

---

### 🔨 3. Backups 模块 (数据备份)

**实施步骤**:

#### 3.1 安装依赖

```bash
pnpm add archiver
pnpm add -D @types/archiver
```

#### 3.2 创建 Entity

文件: `apps/backend/src/entities/backup.entity.ts`

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('backups')
export class Backup {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty({ enum: ['full', 'incremental'] })
  @Column()
  type: 'full' | 'incremental';

  @ApiProperty()
  @Column({ type: 'bigint' })
  size: number;

  @ApiProperty({ enum: ['completed', 'failed', 'in_progress'] })
  @Column({ default: 'in_progress' })
  status: 'completed' | 'failed' | 'in_progress';

  @ApiProperty()
  @Column()
  filePath: string;

  @ApiProperty({ required: false })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;
}
```

#### 3.3 创建 Service (核心备份逻辑)

文件: `apps/backend/src/modules/backups/backups.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Backup } from '../../entities/backup.entity';
import * as archiver from 'archiver';
import * as fs from 'fs-extra';
import * as path from 'path';

@Injectable()
export class BackupsService {
  constructor(
    @InjectRepository(Backup)
    private backupsRepository: Repository<Backup>,
  ) {}

  async create(createBackupDto: {
    name: string;
    type: 'full' | 'incremental';
  }) {
    const backup = this.backupsRepository.create({
      ...createBackupDto,
      status: 'in_progress',
      filePath: `backups/${createBackupDto.name}.zip`,
    });

    const savedBackup = await this.backupsRepository.save(backup);

    // 异步执行备份
    this.performBackup(savedBackup.id).catch(console.error);

    return savedBackup;
  }

  private async performBackup(backupId: string) {
    const backup = await this.backupsRepository.findOne({
      where: { id: backupId },
    });
    if (!backup) return;

    try {
      const backupDir = path.join(process.cwd(), 'backups');
      await fs.ensureDir(backupDir);

      const filePath = path.join(backupDir, `${backup.name}.zip`);
      const output = fs.createWriteStream(filePath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', async () => {
        backup.size = archive.pointer();
        backup.status = 'completed';
        await this.backupsRepository.save(backup);
      });

      archive.on('error', async (err) => {
        backup.status = 'failed';
        await this.backupsRepository.save(backup);
        throw err;
      });

      archive.pipe(output);

      // 添加数据库备份（示例）
      // archive.file('database.sql', { name: 'database.sql' });

      await archive.finalize();
    } catch (error) {
      backup.status = 'failed';
      await this.backupsRepository.save(backup);
    }
  }

  async findAll() {
    return this.backupsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async remove(id: string) {
    const backup = await this.backupsRepository.findOne({ where: { id } });
    if (backup) {
      // 删除文件
      const filePath = path.join(process.cwd(), backup.filePath);
      await fs.remove(filePath).catch(() => {});

      // 删除记录
      await this.backupsRepository.delete(id);
    }
  }
}
```

---

### 🔨 4. Tasks 模块 (任务队列)

**实施步骤**:

#### 4.1 安装依赖

```bash
pnpm add @nestjs/bull bull
pnpm add -D @types/bull
```

#### 4.2 创建 Entity

文件: `apps/backend/src/entities/task.entity.ts`

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('tasks')
export class Task {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty({ enum: ['scan', 'thumbnail', 'backup', 'cleanup', 'import'] })
  @Column()
  type: 'scan' | 'thumbnail' | 'backup' | 'cleanup' | 'import';

  @ApiProperty({
    enum: ['pending', 'running', 'completed', 'failed', 'cancelled'],
  })
  @Column({ default: 'pending' })
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

  @ApiProperty()
  @Column({ type: 'int', default: 0 })
  progress: number;

  @ApiProperty({ required: false })
  @Column({ type: 'timestamp', nullable: true })
  startTime?: Date;

  @ApiProperty({ required: false })
  @Column({ type: 'timestamp', nullable: true })
  endTime?: Date;

  @ApiProperty({ required: false })
  @Column({ type: 'text', nullable: true })
  error?: string;

  @ApiProperty({ required: false })
  @Column({ type: 'json', nullable: true })
  result?: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

#### 4.3 配置 Bull Queue

文件: `apps/backend/src/modules/tasks/tasks.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TasksProcessor } from './tasks.processor';
import { Task } from '../../entities/task.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task]),
    BullModule.registerQueue({
      name: 'tasks',
    }),
  ],
  controllers: [TasksController],
  providers: [TasksService, TasksProcessor],
  exports: [TasksService],
})
export class TasksModule {}
```

#### 4.4 创建 Processor

文件: `apps/backend/src/modules/tasks/tasks.processor.ts`

```typescript
import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../../entities/task.entity';

@Processor('tasks')
export class TasksProcessor {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) {}

  @Process()
  async handleTask(job: Job) {
    const task = await this.tasksRepository.findOne({
      where: { id: job.data.taskId },
    });
    if (!task) return;

    try {
      task.status = 'running';
      task.startTime = new Date();
      await this.tasksRepository.save(task);

      // 根据任务类型执行不同逻辑
      switch (task.type) {
        case 'scan':
          await this.performScan(task, job);
          break;
        case 'thumbnail':
          await this.performThumbnail(task, job);
          break;
        // ... 其他类型
      }

      task.status = 'completed';
      task.progress = 100;
      task.endTime = new Date();
      await this.tasksRepository.save(task);
    } catch (error) {
      task.status = 'failed';
      task.error = error.message;
      task.endTime = new Date();
      await this.tasksRepository.save(task);
    }
  }

  private async performScan(task: Task, job: Job) {
    // 模拟扫描进度
    for (let i = 0; i <= 100; i += 10) {
      task.progress = i;
      await this.tasksRepository.save(task);
      await job.progress(i);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  private async performThumbnail(task: Task, job: Job) {
    // 缩略图生成逻辑
  }
}
```

---

## 注册模块到 AppModule

文件: `apps/backend/src/app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { ComicsModule } from './modules/comics/comics.module';
import { ChaptersModule } from './modules/chapters/chapters.module';
import { FilesModule } from './modules/files/files.module';
import { ImagesModule } from './modules/images/images.module';
import { UsersModule } from './modules/users/users.module';
import { StatsModule } from './modules/stats/stats.module';
import { LogsModule } from './modules/logs/logs.module';
import { BackupsModule } from './modules/backups/backups.module';
import { TasksModule } from './modules/tasks/tasks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
      },
    }),
    DatabaseModule,
    ComicsModule,
    ChaptersModule,
    FilesModule,
    ImagesModule,
    UsersModule,
    StatsModule,
    LogsModule,
    BackupsModule,
    TasksModule,
  ],
})
export class AppModule {}
```

---

## 数据库迁移

创建迁移文件：

```bash
npm run typeorm migration:generate -- -n AddNewModules
npm run typeorm migration:run
```

或手动执行 SQL：

```sql
-- SystemLog 表
CREATE TABLE `system_logs` (
  `id` varchar(36) PRIMARY KEY,
  `level` varchar(10) NOT NULL,
  `message` text NOT NULL,
  `module` varchar(50) NOT NULL,
  `userId` varchar(36),
  `username` varchar(100),
  `ip` varchar(45),
  `metadata` json,
  `createdAt` datetime(6) DEFAULT CURRENT_TIMESTAMP(6),
  INDEX `idx_level` (`level`),
  INDEX `idx_module` (`module`),
  INDEX `idx_createdAt` (`createdAt`)
);

-- Backup 表
CREATE TABLE `backups` (
  `id` varchar(36) PRIMARY KEY,
  `name` varchar(255) NOT NULL,
  `type` varchar(20) NOT NULL,
  `size` bigint NOT NULL DEFAULT 0,
  `status` varchar(20) NOT NULL DEFAULT 'in_progress',
  `filePath` varchar(500) NOT NULL,
  `description` text,
  `createdAt` datetime(6) DEFAULT CURRENT_TIMESTAMP(6)
);

-- Task 表
CREATE TABLE `tasks` (
  `id` varchar(36) PRIMARY KEY,
  `name` varchar(255) NOT NULL,
  `type` varchar(20) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'pending',
  `progress` int NOT NULL DEFAULT 0,
  `startTime` datetime,
  `endTime` datetime,
  `error` text,
  `result` json,
  `createdAt` datetime(6) DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
);

-- Comic 表添加字段
ALTER TABLE `comics` ADD COLUMN `readCount` int NOT NULL DEFAULT 0;
```

---

## 环境变量配置

`.env` 文件添加：

```env
# Redis (for Bull Queue)
REDIS_HOST=localhost
REDIS_PORT=6379

# Backup path
BACKUP_PATH=./backups
```

---

## 测试 API

使用 Postman 或 curl 测试：

```bash
# 统计数据
curl http://localhost:4399/stats/overview

# 日志
curl http://localhost:4399/logs?page=1&pageSize=10

# 备份
curl -X POST http://localhost:4399/backups -H "Content-Type: application/json" -d '{"name":"backup-2024-01-29","type":"full"}'

# 任务
curl -X POST http://localhost:4399/tasks -H "Content-Type: application/json" -d '{"name":"扫描新漫画","type":"scan"}'
```

---

## 总结

实施完成后，后端将提供：

- ✅ Stats API - Dashboard 数据支持
- ✅ Logs API - 系统日志管理
- ✅ Backups API - 数据备份恢复
- ✅ Tasks API - 后台任务队列

前端已准备就绪，后端完成后即可无缝集成！
