import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chapter } from '@entities/chapter.entity';
import { ReadingProgress } from '@entities/reading-progress.entity';
import { CreateChapterDto } from './dto/create-chapter.dto';

@Injectable()
export class ChaptersService {
  constructor(
    @InjectRepository(Chapter)
    private readonly chapterRepository: Repository<Chapter>,
    @InjectRepository(ReadingProgress)
    private readonly progressRepository: Repository<ReadingProgress>,
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

    const chapters = await queryBuilder.getMany();

    // 如果有 comicId，加载所有章节的阅读进度
    if (comicId && chapters.length > 0) {
      const chapterIds = chapters.map((ch) => ch.id);
      const progressRecords = await this.progressRepository.find({
        where: chapterIds.map((id) => ({ comicId, chapterId: id })),
      });

      // 将进度附加到对应的章节
      const progressMap = new Map(progressRecords.map((p) => [p.chapterId, p]));
      chapters.forEach((chapter) => {
        const progress = progressMap.get(chapter.id);
        if (progress) {
          (chapter as any).readingProgress = progress;
        }
      });
    }

    return chapters;
  }

  async findOne(id: string): Promise<Chapter> {
    const chapter = await this.chapterRepository.findOne({
      where: { id },
      relations: ['comic'],
    });
    return chapter!;
  }
}
