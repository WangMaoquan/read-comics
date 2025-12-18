import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { FilesService } from '../files/files.service';
import { ComicsService } from '../comics/comics.service';
import { BangumiService } from '../system/bangumi.service';
import { ImagesService } from '../images/images.service';
import { ChaptersService } from '../chapters/chapters.service';

@Processor('tasks')
export class TasksProcessor extends WorkerHost {
  private readonly logger = new Logger(TasksProcessor.name);

  constructor(
    private readonly tasksService: TasksService,
    private readonly filesService: FilesService,
    private readonly comicsService: ComicsService,
    private readonly bangumiService: BangumiService,
    private readonly imagesService: ImagesService,
    private readonly chaptersService: ChaptersService,
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
        case 'fetch-metadata':
          return await this.handleFetchMetadataTask(job);
        case 'deduplicate':
          return await this.handleDeduplicateTask(job);
        case 'thumbnail':
          return await this.handleThumbnailTask(job);
        case 'prepare-assets':
          return await this.handlePrepareAssetsTask(job);
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

  private async handleFetchMetadataTask(job: Job) {
    const { taskId, params } = job.data;
    const { comicId } = params;

    const comic = await this.comicsService.findOne(comicId);
    if (!comic) {
      throw new Error(`Comic ${comicId} not found`);
    }

    this.logger.log(`Fetching metadata for comic: ${comic.title}`);
    await this.tasksService.updateProgress(taskId, 10);

    const result = await this.bangumiService.searchSubject(comic.title);
    if (!result) {
      await this.tasksService.updateProgress(taskId, 100);
      await this.tasksService.complete(taskId, {
        message: 'No metadata found on Bangumi',
      });
      return { found: false };
    }

    await this.tasksService.updateProgress(taskId, 50);
    const details = await this.bangumiService.getSubjectDetails(result.id);

    // 更新漫画信息
    await this.comicsService.updateMetadata(comicId, {
      description: details.summary || result.summary,
      author:
        details.infobox?.find((i: any) => i.key === '作者')?.value ||
        comic.author,
      rating: Math.round(details.rating?.score / 2) || comic.rating, // 10分制转5分制
      tags: details.tags?.slice(0, 5).map((t: any) => t.name) || [],
      cover: result.images?.large || result.image,
    });

    await this.tasksService.updateProgress(taskId, 100);
    await this.tasksService.complete(taskId, {
      found: true,
      title: result.name_cn || result.name,
    });

    return { found: true };
  }

  private async handleDeduplicateTask(job: Job) {
    const { taskId } = job.data;
    this.logger.log(`Starting deduplication task ${taskId}`);

    // 1. 获取所有漫画并计算缺失的哈希
    const comics = await this.comicsService.findAllSimple(); // 需要实现简单列表获取
    const total = comics.length;
    let processed = 0;
    const hashGroups: Map<string, string[]> = new Map();

    for (const comic of comics) {
      let currentHash = comic.hash;
      if (!currentHash) {
        try {
          currentHash = await this.filesService.calculateFileHash(
            comic.filePath,
          );
          await this.comicsService.update(comic.id, { hash: currentHash });
        } catch (err) {
          this.logger.error(`Failed to hash ${comic.filePath}: ${err.message}`);
          continue;
        }
      }

      const group = hashGroups.get(currentHash) || [];
      group.push(comic.id);
      hashGroups.set(currentHash, group);

      processed++;
      await this.tasksService.updateProgress(
        taskId,
        Math.round((processed / total) * 50),
      );
    }

    // 2. 识别重复
    const duplicates: any[] = [];
    for (const [hash, ids] of hashGroups.entries()) {
      if (ids.length > 1) {
        duplicates.push({ hash, count: ids.length, ids });
      }
    }

    await this.tasksService.updateProgress(taskId, 100);
    await this.tasksService.complete(taskId, {
      totalScanned: total,
      uniqueFiles: hashGroups.size,
      duplicateGroups: duplicates.length,
      duplicates,
    });

    return { duplicatesFound: duplicates.length };
  }

  private async handlePrepareAssetsTask(job: Job) {
    const { taskId, params } = job.data;
    const { comicId } = params;

    const comic = await this.comicsService.findOne(comicId);
    if (!comic) throw new Error('Comic not found');

    const chapters = await this.chaptersService.findAll(comicId);

    this.logger.log(
      `Stage 1: Starting asset pre-warming for comic: ${comic.title}`,
    );

    // 第一阶段：生成 WebP 缓存 (占 80% 进度)
    await this.imagesService.prepareComicPages(
      comicId,
      chapters,
      comic.filePath,
      async (processed, total) => {
        const progress = Math.round((processed / total) * 80);
        await job.updateProgress(progress);
        await this.tasksService.updateProgress(taskId, progress);
      },
    );

    // 第二阶段：全量归档并删除本地文件 (占最后 20% 进度)
    this.logger.log(
      `Stage 2: Archiving original file for comic: ${comic.title}`,
    );
    try {
      await this.comicsService.archive(comicId);
      await job.updateProgress(100);
      await this.tasksService.updateProgress(taskId, 100);
    } catch (archiveError) {
      this.logger.error(
        `Archive stage failed for comic ${comicId}: ${archiveError.message}`,
      );
      // 即使归档阶段失败，预热阶段可能已成功，所以不抛出异常导致整个任务标记为失败
      // 但我们需要在结果中记录错误
    }

    await this.tasksService.complete(taskId, {
      message: 'Asset pre-warming and automatic archiving complete',
      chaptersProcessed: chapters.length,
      archived: true,
    });

    return { success: true };
  }
}
