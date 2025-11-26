import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chapter } from '../../entities/chapter.entity';
import { CreateChapterDto } from './dto/create-chapter.dto';

@Injectable()
export class ChaptersService {
  constructor(
    @InjectRepository(Chapter)
    private readonly chapterRepository: Repository<Chapter>,
  ) {}

  async create(createChapterDto: CreateChapterDto): Promise<Chapter> {
    const chapter = this.chapterRepository.create({
      ...createChapterDto,
      comic: { id: createChapterDto.comicId },
    });
    return await this.chapterRepository.save(chapter);
  }

  async findAll(comicId?: string): Promise<Chapter[]> {
    const queryBuilder = this.chapterRepository.createQueryBuilder('chapter');

    if (comicId) {
      queryBuilder.where('chapter.comicId = :comicId', { comicId });
    }

    queryBuilder.orderBy('chapter.pageNumber', 'ASC');

    return await queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Chapter> {
    const chapter = await this.chapterRepository.findOne({
      where: { id },
      relations: ['comic'],
    });
    return chapter!;
  }
}
