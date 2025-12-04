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
import { ComicFilter } from '@read-comics/types';

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

  async findAll(filter?: ComicFilter): Promise<Comic[]> {
    const queryBuilder = this.comicRepository.createQueryBuilder('comic');

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

    if (filter?.sortBy) {
      const sortOrder = filter.sortOrder === 'desc' ? 'DESC' : 'ASC';
      queryBuilder.orderBy(`comic.${filter.sortBy}`, sortOrder);
    }

    return await queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Comic> {
    const comic = await this.comicRepository.findOne({ where: { id } });

    if (comic) {
      // 加载所有阅读进度
      const progressRecords = await this.progressRepository.find({
        where: { comicId: id },
        order: { lastReadAt: 'DESC' },
      });

      if (progressRecords.length > 0) {
        comic.readingProgress = progressRecords;
      }
    }

    return comic!;
  }

  async findByHash(hash: string): Promise<Comic | null> {
    return await this.comicRepository.findOne({ where: { hash } });
  }

  async update(id: string, updateComicDto: UpdateComicDto): Promise<Comic> {
    await this.comicRepository.update(id, updateComicDto);
    return await this.findOne(id);
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
