import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Comic } from '@entities/comic.entity';
import { Chapter } from '@entities/chapter.entity';
import { ReadingProgress } from '@entities/reading-progress.entity';
import { CreateComicDto } from './dto/create-comic.dto';
import { UpdateComicDto } from './dto/update-comic.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { ComicFilter } from '@read-comics/types';

import { ChaptersService } from '../chapters/chapters.service';

@Injectable()
export class ComicsService {
  constructor(
    @InjectRepository(Comic)
    private readonly comicRepository: Repository<Comic>,
    @InjectRepository(ReadingProgress)
    private readonly progressRepository: Repository<ReadingProgress>,
    private readonly chaptersService: ChaptersService,
    private readonly dataSource: DataSource,
  ) {}

  async create(createComicDto: CreateComicDto): Promise<Comic> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const comic = this.comicRepository.create(createComicDto);
      const savedComic = await queryRunner.manager.save(comic);

      // Create chapters
      if (createComicDto.chapters && createComicDto.chapters.length > 0) {
        for (let i = 0; i < createComicDto.chapters.length; i++) {
          const chapterData = createComicDto.chapters[i];
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
        // Fallback: Create default chapter
        const chapter = queryRunner.manager.create(Chapter, {
          title: '第 1 话',
          pageNumber: 1,
          imagePath: savedComic.filePath,
          pages: [],
          comic: savedComic,
        });
        await queryRunner.manager.save(Chapter, chapter);
      }

      // ...

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

    if (filter?.sortBy) {
      const sortOrder = filter.sortOrder === 'desc' ? 'DESC' : 'ASC';
      queryBuilder.orderBy(`comic.${filter.sortBy}`, sortOrder);
    }

    return await queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Comic> {
    const comic = await this.comicRepository.findOne({ where: { id } });
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

  async count(): Promise<number> {
    return await this.comicRepository.count();
  }

  async updateProgress(
    comicId: string,
    updateProgressDto: UpdateProgressDto,
  ): Promise<ReadingProgress> {
    let progress = await this.progressRepository.findOne({
      where: { comicId },
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
      progress.chapterId = updateProgressDto.chapterId;
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
    return await this.progressRepository.findOne({
      where: { comicId },
    });
  }
}
