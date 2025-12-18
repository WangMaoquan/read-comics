import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { FilesService } from '../files/files.service';
import { ComicsService } from '../comics/comics.service';

@Processor('tasks')
export class TasksProcessor extends WorkerHost {
  private readonly logger = new Logger(TasksProcessor.name);

  constructor(
    private readonly tasksService: TasksService,
    private readonly filesService: FilesService,
    private readonly comicsService: ComicsService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { taskId, type, params } = job.data;
    this.logger.log(`Processing task ${taskId} of type ${type}`);

    try {
      // 更新状态为运行中
      await this.tasksService.updateStatus(taskId, 'running');

      switch (type) {
        case 'scan':
          return await this.handleScanTask(job);
        case 'thumbnail':
          return await this.handleThumbnailTask(job);
        default:
          this.logger.warn(`Unknown task type: ${type}`);
          return { message: 'Unknown task type' };
      }
    } catch (error) {
      this.logger.error(`Task ${taskId} failed: ${error.message}`, error.stack);
      await this.tasksService.handleError(taskId, error.message);
      throw error;
    }
  }

  private async handleScanTask(job: Job) {
    const { taskId } = job.data;
    this.logger.log(`Starting scan task ${taskId}`);

    // 1. 获取所有待扫描的文件
    const files = await this.filesService.scanComicsDirectory();
    const total = files.length;

    if (total === 0) {
      await this.tasksService.updateProgress(taskId, 100);
      await this.tasksService.complete(taskId, { found: 0 });
      return { found: 0 };
    }

    let processed = 0;
    for (const filePath of files) {
      try {
        // 进行具体的解析和入库逻辑
        await this.comicsService.importFromPath(filePath);

        processed++;
        const progress = Math.round((processed / total) * 100);
        await job.updateProgress(progress);
        await this.tasksService.updateProgress(taskId, progress);
      } catch (err) {
        this.logger.error(`Failed to process file ${filePath}: ${err.message}`);
      }
    }

    const result = { total, processed };
    await this.tasksService.complete(taskId, result);
    return result;
  }

  private async handleThumbnailTask(job: Job) {
    // 模拟缩略图生成
    const { taskId } = job.data;
    for (let i = 0; i <= 100; i += 20) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await job.updateProgress(i);
      await this.tasksService.updateProgress(taskId, i);
    }
    await this.tasksService.complete(taskId, {
      message: 'Thumbnails generated',
    });
    return { success: true };
  }
}
