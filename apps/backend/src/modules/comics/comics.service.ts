import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Comic } from '@entities/comic.entity';
import { Chapter } from '@entities/chapter.entity';
import { ReadingProgress } from '@entities/reading-progress.entity';
import { Tag } from '@entities/tag.entity';
import { CreateComicDto } from './dto/create-comic.dto';
import { UpdateComicDto } from './dto/update-comic.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { ComicFilter, ComicStatus, PaginatedResult } from '@read-comics/types';

import { ChaptersService } from '../chapters/chapters.service';
import { FavoritesService } from '../favorites/favorites.service';

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
  ) {}

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

    // 排序
    if (filter?.sortBy) {
      const sortOrder = filter.sortOrder === 'desc' ? 'DESC' : 'ASC';
      queryBuilder.orderBy(`comic.${filter.sortBy}`, sortOrder);
    } else {
      queryBuilder.orderBy('comic.createdAt', 'DESC');
    }

    // 分页
    queryBuilder.skip(skip).take(pageSize);

    // 执行查询 - 不加载关联数据
    const [comics, total] = await queryBuilder.getManyAndCount();

    // 批量加载进度数据（优化 N+1 问题）
    const comicIds = comics.map((c) => c.id);
    const progressData = await this.getProgressData(comicIds);

    // 计算 status 和 progress
    const enrichedComics = comics.map((comic) => {
      const data = progressData.get(comic.id);
      return {
        ...comic,
        progress: data?.progress || 0,
        status: data?.status || ComicStatus.UNREAD,
      } as Comic;
    });

    return {
      data: enrichedComics,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 批量获取进度数据（避免 N+1 查询）
   */
  private async getProgressData(
    comicIds: string[],
  ): Promise<Map<string, { progress: number; status: string }>> {
    if (comicIds.length === 0) return new Map();

    const result = await this.comicRepository
      .createQueryBuilder('comic')
      .leftJoin('comic.chapters', 'chapters')
      .leftJoin('comic.readingProgress', 'progress')
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
}
