import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Comic } from '../../entities/comic.entity';
import { Chapter } from '../../entities/chapter.entity';
import { CreateComicDto } from './dto/create-comic.dto';
import { UpdateComicDto } from './dto/update-comic.dto';
import { ComicFilter } from '@read-comics/types';

import { ChaptersService } from '../chapters/chapters.service';

@Injectable()
export class ComicsService {
  constructor(
    @InjectRepository(Comic)
    private readonly comicRepository: Repository<Comic>,
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

  async toggleFavorite(id: string): Promise<Comic> {
    const comic = await this.findOne(id);
    if (!comic) {
      throw new Error('Comic not found');
    }
    comic.isFavorite = !comic.isFavorite;
    return await this.comicRepository.save(comic);
  }

  async count(): Promise<number> {
    return await this.comicRepository.count();
  }
}
