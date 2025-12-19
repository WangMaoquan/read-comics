import {
  Injectable,
  StreamableFile,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import * as fs from 'fs/promises';
import * as archiver from 'archiver';
import { basename, extname } from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { PathUtils } from '@common/utils/path-utils';
import { Comic } from '@entities/comic.entity';
import { Chapter } from '@entities/chapter.entity';
import { Task } from '@entities/task.entity';
import { ReadingProgress } from '@entities/reading-progress.entity';
import { Tag } from '@entities/tag.entity';
import { CreateComicDto } from './dto/create-comic.dto';
import { UpdateComicDto } from './dto/update-comic.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { ComicFilter, ComicStatus, PaginatedResult } from '@read-comics/types';

import { ChaptersService } from '../chapters/chapters.service';
import { FavoritesService } from '../favorites/favorites.service';
import { ImagesService } from '../images/images.service';
import { FilesService } from '../files/files.service';
import { TasksService } from '../tasks/tasks.service';

@Injectable()
export class ComicsService {
  constructor(
    @InjectRepository(Comic)
    private readonly comicRepository: Repository<Comic>,
    @InjectRepository(ReadingProgress)
    private readonly progressRepository: Repository<ReadingProgress>,
    private readonly chaptersService: ChaptersService,
    private readonly favoritesService: FavoritesService,
    private readonly dataSource: DataSource,
    private readonly imagesService: ImagesService,
    private readonly filesService: FilesService,
    @Inject(forwardRef(() => TasksService))
    private readonly tasksService: TasksService,
  ) {}

  async importFromPath(filePath: string): Promise<Comic | null> {
    // 1. 检查是否已存在 (通过文件路径)
    const existing = await this.comicRepository.findOne({
      where: { filePath },
    });
    if (existing) return existing;

    try {
      // 2. 解析文件
      const comicData = await this.filesService.parseComicFile(filePath);
      const fileInfo = await this.filesService.getFileInfo(filePath);

      // 3. 创建漫画记录
      return await this.create({
        title: comicData.title,
        filePath: filePath,
        fileSize: fileInfo.size,
        fileFormat: comicData.format,
        totalPages: comicData.totalPages,
        status: ComicStatus.UNREAD,
        chapters: comicData.chapters,
      });
    } catch (error) {
      console.error(`Failed to import comic from ${filePath}:`, error);
      return null;
    }
  }

  async create(createComicDto: CreateComicDto): Promise<Comic> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 提取 tags 和 chapters，它们需要特殊处理
      const {
        tags: tagNames,
        chapters: chaptersData,
        ...comicData
      } = createComicDto;

      // 创建漫画实体（不包含 tags 和 chapters）
      const comic = this.comicRepository.create(comicData);
      const savedComic = await queryRunner.manager.save(Comic, comic);

      // 处理标签
      if (tagNames && tagNames.length > 0) {
        const tags: Tag[] = [];
        for (const tagName of tagNames) {
          // 查找或创建标签
          let tag = await queryRunner.manager.findOne(Tag, {
            where: { name: tagName },
          });

          if (!tag) {
            tag = queryRunner.manager.create(Tag, { name: tagName });
            tag = await queryRunner.manager.save(Tag, tag);
          }

          tags.push(tag);
        }

        // 关联标签到漫画
        savedComic.tags = tags;
        await queryRunner.manager.save(Comic, savedComic);
      }

      // 创建章节
      if (chaptersData && chaptersData.length > 0) {
        for (let i = 0; i < chaptersData.length; i++) {
          const chapterData = chaptersData[i];
          const chapter = queryRunner.manager.create(Chapter, {
            title: chapterData.title,
            pageNumber: i + 1,
            imagePath: savedComic.filePath,
            pages: chapterData.pages,
            comic: savedComic,
          });
          await queryRunner.manager.save(Chapter, chapter);
        }
      } else {
        // 回退：创建默认章节
        const chapter = queryRunner.manager.create(Chapter, {
          title: '第 1 话',
          pageNumber: 1,
          imagePath: savedComic.filePath,
          pages: [],
          comic: savedComic,
        });
        await queryRunner.manager.save(Chapter, chapter);
      }

      await queryRunner.commitTransaction();

      return savedComic;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(filter?: ComicFilter): Promise<PaginatedResult<Comic>> {
    const page = filter?.page || 1;
    const pageSize = Math.min(filter?.pageSize || 20, 100); // 最大 100
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.comicRepository.createQueryBuilder('comic');

    // 应用过滤条件
    if (filter?.search) {
      queryBuilder.where('comic.title LIKE :search', {
        search: `%${filter.search}%`,
      });
    }

    if (filter?.format && filter.format.length > 0) {
      queryBuilder.andWhere('comic.fileFormat IN (:...formats)', {
        formats: filter.format,
      });
    }

    if (filter?.status && filter.status.length > 0) {
      queryBuilder.andWhere('comic.status IN (:...statuses)', {
        statuses: filter.status,
      });
    }

    if (filter?.isFavorite !== undefined) {
      queryBuilder.andWhere('comic.isFavorite = :isFavorite', {
        isFavorite: filter.isFavorite ? 1 : 0,
      });
    }

    const requestedSort = filter?.sortBy;
    const sortOrder = filter?.sortOrder === 'desc' ? 'desc' : 'asc';

    // 将“为 comics 加上 progress/status”封装为复用函数
    const enrich = async (comics: Comic[]) => {
      if (comics.length === 0) return [] as (Comic & { progress: number })[];
      const comicIds = comics.map((c) => c.id);
      const progressData = await this.getProgressData(comicIds);

      return comics.map((comic) => {
        const data = progressData.get(comic.id);
        return {
          ...comic,
          progress: data?.progress ?? 0,
          status: data?.status ?? ComicStatus.UNREAD,
        } as Comic & { progress: number };
      });
    };

    const isSortByProgress = requestedSort === 'lastReadAt';

    if (isSortByProgress) {
      // 按阅读进度排序：先取出所有匹配项 -> enrich -> 内存排序 -> 分页
      queryBuilder.orderBy('comic.createdAt', 'DESC'); // 保持稳定顺序
      const allComics = await queryBuilder.getMany();
      const total = allComics.length;

      const enriched = await enrich(allComics);
      enriched.sort((a, b) =>
        sortOrder === 'desc'
          ? b.progress - a.progress
          : a.progress - b.progress,
      );

      const paged = enriched.slice(skip, skip + pageSize);

      return {
        data: paged,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    } else {
      // 非按进度排序：在 DB 做排序与分页，查询后再 enrich
      if (requestedSort) {
        const order = sortOrder === 'desc' ? 'DESC' : 'ASC';
        queryBuilder.orderBy(`comic.${requestedSort}`, order);
      } else {
        queryBuilder.orderBy('comic.createdAt', 'DESC');
      }

      queryBuilder.skip(skip).take(pageSize);

      const [comics, total] = await queryBuilder.getManyAndCount();
      const enrichedComics = await enrich(comics);

      return {
        data: enrichedComics,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    }
  }

  /**
   * 批量获取进度数据（避免 N+1 查询）
   *
   * 实现说明：
   * 1) 问题背景：
   *    之前在查询时同时 leftJoin chapters 与 readingProgress，
   *    如果不为 progress 和 chapters 加上关联条件，会出现 chapters × progress 的笛卡尔乘积，
   *    导致 SUM/COUNT 等聚合值被重复计算（readPages 被放大，例如从 13 变为 26）。
   *
   * 2) 解决方案摘要：
   *    - 在 leftJoin readingProgress 时加入连接条件 'progress.chapterId = chapters.id'，
   *      确保每条 progress 只与其对应的 chapter 关联，避免重复行。
   *    - 关于已读页数 (readPages) 的计算规则：
   *      * 对于已完成章节（isReadComplete = true），计入整章页数（progress.totalPages），因为整章都读完了。
   *      * 对于未完成章节，progress.currentPage 是 0-based 的当前页索引（例如 0 表示第 1 页），
   *        因此已读页数应当使用 progress.currentPage + 1；在本 query 中直接使用 progress.currentPage
   *        时请确保 currentPage 的语义与数据库字段一致（在早期实现中可能为 1-based 或 0-based），
   *        如果数据库中保存的是 0-based 需要加 1；如果是已经保存为已读页数则无需 +1。
   *
   * 3) 兼容性与安全：
   *    - 使用 COALESCE(..., 0) 保证聚合为空时返回 0。
   *    - COUNT(DISTINCT ...) 用以统计不重复的章节/进度条目。
   *
   * 注意：如果在其它地方（如 updateProgress）对 currentPage 的语义有修改，需要同步调整这里的加/减偏移逻辑。
   */
  private async getProgressData(
    comicIds: string[],
  ): Promise<Map<string, { progress: number; status: string }>> {
    if (comicIds.length === 0) return new Map();

    // 重要：给 progress 加上与 chapters 的连接条件，避免 chapters 与 progress 的笛卡尔乘积
    const result = await this.comicRepository
      .createQueryBuilder('comic')
      .leftJoin('comic.chapters', 'chapters')
      .leftJoin(
        'comic.readingProgress',
        'progress',
        'progress.chapterId = chapters.id',
      )
      .select([
        'comic.id as comicId',
        'comic.totalPages as totalPages',
        'COUNT(DISTINCT chapters.id) as totalChapters',
        'COUNT(DISTINCT CASE WHEN progress.isReadComplete = 1 THEN progress.id END) as completedChapters',
        'COALESCE(SUM(CASE WHEN progress.isReadComplete = 1 THEN progress.totalPages ELSE progress.currentPage END), 0) as readPages',
      ])
      .where('comic.id IN (:...comicIds)', { comicIds })
      .groupBy('comic.id')
      .getRawMany();

    const dataMap = new Map();

    for (const row of result) {
      const readPages = parseInt(row.readPages) || 0;
      const totalPages = parseInt(row.totalPages) || 1;
      const totalChapters = parseInt(row.totalChapters) || 0;
      const completedChapters = parseInt(row.completedChapters) || 0;

      let progress = 0;
      let status = ComicStatus.UNREAD;

      if (completedChapters === 0) {
        progress = 0;
        status = ComicStatus.UNREAD;
      } else if (totalChapters > 0 && completedChapters === totalChapters) {
        progress = 100;
        status = ComicStatus.COMPLETED;
      } else {
        progress = Math.round((readPages / totalPages) * 100);
        status = ComicStatus.READING;
      }

      dataMap.set(row.comicId, { progress, status });
    }

    return dataMap;
  }

  async findAllSimple(): Promise<Comic[]> {
    return this.comicRepository.find();
  }

  // 后续补充 vo , 需要将 对应 的vo 放到 packages/types 中
  async findOne(id: string): Promise<Comic | null> {
    const comic = await this.comicRepository.findOne({ where: { id } });

    if (!comic) {
      return null;
    }

    // 加载所有阅读进度
    const progressRecords = await this.progressRepository.find({
      where: { comicId: id },
      order: { lastReadAt: 'DESC' },
    });

    const chapters = await this.chaptersService.findAll(id);

    // 计算状态（与 findAll 保持一致）
    let status: string = ComicStatus.UNREAD;

    if (progressRecords.length === 0) {
      status = ComicStatus.UNREAD;
    } else if (
      progressRecords.length === chapters.length &&
      progressRecords.every((p) => p.isReadComplete === true)
    ) {
      status = ComicStatus.COMPLETED;
    } else {
      status = ComicStatus.READING;
    }

    return {
      ...comic,
      status,
    } as Comic;
  }

  async findByHash(hash: string): Promise<Comic | null> {
    return await this.comicRepository.findOne({ where: { hash } });
  }

  async update(id: string, updateComicDto: UpdateComicDto): Promise<Comic> {
    await this.comicRepository.update(id, updateComicDto);
    const comic = await this.findOne(id);
    if (!comic) {
      throw new Error(`Comic with id ${id} not found`);
    }
    return comic;
  }

  async remove(id: string): Promise<void> {
    await this.comicRepository.delete(id);
  }

  async toggleFavorite(id: string, userId: string): Promise<Comic> {
    const comic = await this.findOne(id);
    if (!comic) {
      throw new Error('Comic not found');
    }

    const existingFavorite = await this.favoritesService.findOne(userId, id);

    if (existingFavorite) {
      await this.favoritesService.remove(userId, id);
      comic.isFavorite = false;
    } else {
      await this.favoritesService.create(userId, { comicId: id });
      comic.isFavorite = true;
    }

    return await this.comicRepository.save(comic);
  }

  async updateMetadata(
    id: string,
    metadata: {
      description?: string;
      author?: string;
      rating?: number;
      tags?: string[];
      cover?: string;
    },
  ): Promise<Comic> {
    const comic = await this.comicRepository.findOne({
      where: { id },
      relations: ['tags'],
    });

    if (!comic) {
      throw new Error(`Comic with id ${id} not found`);
    }

    if (metadata.description) comic.description = metadata.description;
    if (metadata.author) comic.author = metadata.author;
    if (metadata.rating) comic.rating = metadata.rating;
    if (metadata.cover) comic.cover = metadata.cover;

    if (metadata.tags && metadata.tags.length > 0) {
      const tags: Tag[] = [];
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();

      try {
        for (const tagName of metadata.tags) {
          let tag = await queryRunner.manager.findOne(Tag, {
            where: { name: tagName },
          });
          if (!tag) {
            tag = queryRunner.manager.create(Tag, { name: tagName });
            tag = await queryRunner.manager.save(Tag, tag);
          }
          tags.push(tag);
        }
        comic.tags = tags;
      } finally {
        await queryRunner.release();
      }
    }

    return await this.comicRepository.save(comic);
  }

  async count(): Promise<number> {
    return await this.comicRepository.count();
  }

  async updateProgress(
    comicId: string,
    updateProgressDto: UpdateProgressDto,
  ): Promise<ReadingProgress> {
    let progress = await this.progressRepository.findOne({
      where: { comicId, chapterId: updateProgressDto.chapterId },
    });

    // 触发后端预热任务 (不再在更新进度时触发，已移至上传/导入环节)

    if (!progress) {
      progress = this.progressRepository.create({
        comicId,
        ...updateProgressDto,
        progress: Math.round(
          (updateProgressDto.currentPage / updateProgressDto.totalPages) * 100,
        ),
      });
    } else {
      progress.currentPage = updateProgressDto.currentPage;
      progress.totalPages = updateProgressDto.totalPages;
      progress.progress = Math.round(
        (updateProgressDto.currentPage / updateProgressDto.totalPages) * 100,
      );
      progress.lastReadAt = new Date();
      if (
        !progress.isReadComplete &&
        progress.totalPages === progress.currentPage + 1
      ) {
        progress.isReadComplete = true; // 标记为已读完成
      }
    }

    // Update comic lastReadAt
    await this.comicRepository.update(comicId, {
      lastReadAt: new Date(),
      readCount: () => 'readCount + 1', // Simple increment, maybe refine later
    });

    return await this.progressRepository.save(progress);
  }

  async getProgress(comicId: string): Promise<ReadingProgress | null> {
    // Return the most recently read chapter progress
    return await this.progressRepository.findOne({
      where: { comicId },
      order: { lastReadAt: 'DESC' },
    });
  }

  async getChapterProgress(
    comicId: string,
    chapterId: string,
  ): Promise<ReadingProgress | null> {
    return await this.progressRepository.findOne({
      where: { comicId, chapterId },
    });
  }

  async archive(id: string): Promise<void> {
    const comic = await this.comicRepository.findOne({
      where: { id },
      relations: ['chapters'],
    });

    if (!comic) {
      throw new Error(`Comic with id ${id} not found`);
    }

    if (!comic.filePath) {
      console.warn(`Comic ${id} has no file path, skipping archive.`);
      return;
    }

    // 1. Collect all images from all chapters
    const allImages: string[] = [];
    if (comic.chapters) {
      for (const chapter of comic.chapters) {
        if (chapter.pages) {
          allImages.push(...chapter.pages);
        }
      }
    }

    // Deduplicate images (just in case)
    const uniqueImages = [...new Set(allImages)];

    if (uniqueImages.length === 0) {
      console.warn(`Comic ${id} has no images to archive.`);
    } else {
      // 2. Archive to S3
      await this.imagesService.archiveComicToS3(comic.filePath, uniqueImages);
    }

    // 3. Delete local file
    try {
      await this.filesService.deleteFile(comic.filePath);
      console.log(`Comic ${id} archived and local file deleted.`);
    } catch (error) {
      console.error(`Failed to delete local file for comic ${id}:`, error);
      // We don't throw here because the main goal (archive to S3) succeeded.
    }
  }

  async download(
    id: string,
    chapterIds?: string[],
  ): Promise<StreamableFile | null> {
    const comic = await this.comicRepository.findOne({
      where: { id },
      relations: ['chapters'],
    });

    if (!comic) {
      throw new NotFoundException(`Comic with id ${id} not found`);
    }

    const archive = archiver('zip', {
      zlib: { level: 9 }, // Sets the compression level.
    });

    // 筛选章节
    let targetChapters = comic.chapters;
    if (chapterIds && chapterIds.length > 0) {
      targetChapters = comic.chapters.filter((c) => chapterIds.includes(c.id));
    }

    // 按顺序排序章节 (pageNumber)
    targetChapters.sort((a, b) => a.pageNumber - b.pageNumber);

    // 异步处理：开始构建 ZIP流
    (async () => {
      try {
        for (const chapter of targetChapters) {
          // 确保 pages 存在
          if (!chapter.pages || chapter.pages.length === 0) continue;

          // 文件夹名：如果是多章节漫画，每章一个文件夹；单章节直接放根目录或者根据喜好
          // 这里使用 "Chapter X" 格式或者直接用章节标题
          const folderName = `Chapter ${chapter.pageNumber.toString().padStart(3, '0')} - ${chapter.title}`;

          for (const pageName of chapter.pages) {
            // 1. 获取 S3 Key
            // 注意：这里需要重新生成 S3 Key，逻辑必须与 prepareImageOnS3 保持一致
            // 幸好 ImagesService 是 public 的，或者我们需要复制逻辑。
            // 最好是 ImagesService 提供一个 helper。
            // 但这里我们没有 helper，只能重新实现一遍 key 生成逻辑。
            // 或者我们在 ImagesService 加一个 getS3Key 方法。
            // 简单起见，这里直接调用 ImagesService 的 helper (但是那个 private)
            // Let's assume we can use the same logic here:
            // cache/comics/{comicHash}/pages/{imageHash}.{ext}

            // 我们需要 access private methods of ImagesService? No.
            // We should add a public method in ImagesService: getS3KeyForImage(comicPath, imagePath).

            // WAIT: We can't easily access private methods.
            // Ideally we refactor code to expose key generation.
            // For now, let's replicate the logic carefully.
            // It depends on comicPath and imagePath.

            const s3Key = await this.imagesService.getS3KeyForImage(
              comic.filePath,
              pageName,
            );

            // Get the actual extension from the S3 key (which reflects the optimized format, e.g., .webp)
            const actualExt = extname(s3Key);
            // Construct the new filename with the correct extension
            const newFileName =
              basename(pageName, extname(pageName)) + actualExt;

            // 2. 获取 S3 流
            try {
              const s3Stream = await this.imagesService.getImageStream(s3Key);
              // 3. 添加到 ZIP
              // 路径： Chapter X/001.webp
              archive.append(s3Stream, {
                name: `${folderName}/${newFileName}`,
              });
            } catch (e) {
              console.warn(
                `Skipping missing image ${pageName} in chapter ${chapter.title}:`,
                e,
              );
            }
          }
        }
        await archive.finalize();
      } catch (err) {
        console.error('Archive error:', err);
        archive.emit('error', err);
      }
    })();

    return new StreamableFile(archive, {
      type: 'application/zip',
      disposition: `attachment; filename="${encodeURIComponent(comic.title)}.zip"`,
    });
  }

  /**
   * 合并重复漫画
   */
  async mergeDuplicates(keepId: string, deleteIds: string[]): Promise<void> {
    const keepComic = await this.comicRepository.findOne({
      where: { id: keepId },
    });
    if (!keepComic) throw new NotFoundException('Keep comic not found');

    for (const deleteId of deleteIds) {
      if (deleteId === keepId) continue;

      const deleteComic = await this.comicRepository.findOne({
        where: { id: deleteId },
      });
      if (!deleteComic) continue;

      // 1. 迁移收藏
      const favorites = await this.favoritesService.findAllByComic(deleteId);
      for (const fav of favorites) {
        await this.favoritesService.migrateFavorite(fav.id, keepId);
      }

      // 2. 迁移阅读进度
      const progresses = await this.progressRepository.find({
        where: { comicId: deleteId },
      });
      for (const prog of progresses) {
        const existing = await this.progressRepository.findOne({
          where: { comicId: keepId, chapterId: prog.chapterId },
        });
        if (!existing) {
          await this.progressRepository.update(prog.id, { comicId: keepId });
        } else {
          if (prog.progress > existing.progress) {
            await this.progressRepository.update(existing.id, {
              progress: prog.progress,
              currentPage: prog.currentPage,
              lastReadAt: prog.lastReadAt,
              isReadComplete: prog.isReadComplete,
            });
          }
          await this.progressRepository.remove(prog);
        }
      }

      // 3. 删除物理文件
      if (deleteComic.filePath) {
        // 只有当路径不同时才物理删除，防止删除同一个文件两次
        if (
          !keepComic.filePath ||
          PathUtils.safeJoin(
            this.filesService.getComicsPath(),
            deleteComic.filePath,
          ) !==
            PathUtils.safeJoin(
              this.filesService.getComicsPath(),
              keepComic.filePath,
            )
        ) {
          try {
            await this.filesService.deleteFile(deleteComic.filePath);
          } catch (e) {
            console.error(
              `Failed-to delete redundant file ${deleteComic.filePath}`,
              e,
            );
          }
        }
      }

      // 4. 删除数据库记录
      await this.comicRepository.delete(deleteId);
    }
  }

  async triggerAssetPrewarm(comicId: string) {
    const comic = await this.comicRepository.findOne({
      where: { id: comicId },
    });
    if (!comic) return;

    // 1. 检查本地文件是否存在
    try {
      await fs.access(comic.filePath);
    } catch (e) {
      // 注意：如果本地文件不存在，且没有待处理/运行中的任务，
      // 说明可能已经处理过并删除了本地文件，或者确实文件丢失。
      return;
    }

    // 2. 检查是否已有该漫画的预热任务在排队、运行或已完成
    const qb = this.dataSource.getRepository(Task).createQueryBuilder('task');
    const existingTask = await qb
      .where("task.type = 'prepare-assets'")
      .andWhere("task.status IN ('pending', 'running', 'completed')")
      .andWhere("task.params ->> 'comicId' = :comicId", { comicId })
      .getOne();

    if (existingTask) return;

    await this.tasksService.create({
      name: `预热资产: ${comic.title}`,
      type: 'prepare-assets',
      params: { comicId },
    });
  }
}
