import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from '@entities/tag.entity';
import { Comic } from '@entities/comic.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private tagsRepository: Repository<Tag>,
    @InjectRepository(Comic)
    private comicsRepository: Repository<Comic>,
  ) {}

  async create(createTagDto: CreateTagDto) {
    // 检查标签是否已存在
    const existing = await this.tagsRepository.findOne({
      where: { name: createTagDto.name },
    });

    if (existing) {
      throw new ConflictException('标签已存在');
    }

    const tag = this.tagsRepository.create({
      name: createTagDto.name,
      color: createTagDto.color || '#3b82f6',
    });

    return await this.tagsRepository.save(tag);
  }

  async findAll() {
    return await this.tagsRepository.find({
      order: { count: 'DESC', name: 'ASC' },
    });
  }

  async findOne(id: string) {
    const tag = await this.tagsRepository.findOne({
      where: { id },
    });

    if (!tag) {
      throw new NotFoundException('标签不存在');
    }

    return tag;
  }

  async findByName(name: string) {
    return await this.tagsRepository.findOne({
      where: { name },
    });
  }

  async update(id: string, updateTagDto: UpdateTagDto) {
    const tag = await this.findOne(id);

    if (updateTagDto.name) {
      // 检查新名称是否已被使用
      const existing = await this.tagsRepository.findOne({
        where: { name: updateTagDto.name },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException('标签名称已被使用');
      }

      tag.name = updateTagDto.name;
    }

    if (updateTagDto.color) {
      tag.color = updateTagDto.color;
    }

    return await this.tagsRepository.save(tag);
  }

  async remove(id: string) {
    const tag = await this.findOne(id);
    await this.tagsRepository.remove(tag);
    return { message: '标签已删除' };
  }

  async getComicsByTag(tagId: string) {
    const tag = await this.tagsRepository.findOne({
      where: { id: tagId },
      relations: ['comics'],
    });

    if (!tag) {
      throw new NotFoundException('标签不存在');
    }

    return tag.comics;
  }

  async addTagToComic(comicId: string, tagId: string) {
    const comic = await this.comicsRepository.findOne({
      where: { id: comicId },
      relations: ['tags'],
    });

    if (!comic) {
      throw new NotFoundException('漫画不存在');
    }

    const tag = await this.findOne(tagId);

    // 检查是否已添加
    if (comic.tags.some((t) => t.id === tagId)) {
      throw new ConflictException('标签已添加到该漫画');
    }

    comic.tags.push(tag);
    tag.count += 1;

    await this.tagsRepository.save(tag);
    await this.comicsRepository.save(comic);

    return comic;
  }

  async removeTagFromComic(comicId: string, tagId: string) {
    const comic = await this.comicsRepository.findOne({
      where: { id: comicId },
      relations: ['tags'],
    });

    if (!comic) {
      throw new NotFoundException('漫画不存在');
    }

    const tag = await this.findOne(tagId);

    comic.tags = comic.tags.filter((t) => t.id !== tagId);
    tag.count = Math.max(0, tag.count - 1);

    await this.tagsRepository.save(tag);
    await this.comicsRepository.save(comic);

    return comic;
  }
}
