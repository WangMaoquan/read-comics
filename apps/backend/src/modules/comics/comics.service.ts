import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comic } from '../../entities/comic.entity';
import { CreateComicDto } from './dto/create-comic.dto';
import { UpdateComicDto } from './dto/update-comic.dto';
import { ComicFilter } from '@read-comics/types';

@Injectable()
export class ComicsService {
  constructor(
    @InjectRepository(Comic)
    private readonly comicRepository: Repository<Comic>,
  ) {}

  async create(createComicDto: CreateComicDto): Promise<Comic> {
    const comic = this.comicRepository.create(createComicDto);
    return await this.comicRepository.save(comic);
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
}
