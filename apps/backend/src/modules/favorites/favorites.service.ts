import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite, FavoriteStatus } from '@entities/favorite.entity';
import { Comic } from '@entities/comic.entity';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private favoritesRepository: Repository<Favorite>,
    @InjectRepository(Comic)
    private comicsRepository: Repository<Comic>,
  ) {}

  async create(userId: string, createFavoriteDto: CreateFavoriteDto) {
    // 检查漫画是否存在
    const comic = await this.comicsRepository.findOne({
      where: { id: createFavoriteDto.comicId },
    });

    if (!comic) {
      throw new NotFoundException('漫画不存在');
    }

    // 检查是否已收藏
    const existing = await this.favoritesRepository.findOne({
      where: {
        userId,
        comicId: createFavoriteDto.comicId,
      },
    });

    if (existing) {
      throw new ConflictException('该漫画已在收藏列表中');
    }

    const favorite = this.favoritesRepository.create({
      userId,
      comicId: createFavoriteDto.comicId,
      status: createFavoriteDto.status || FavoriteStatus.READING,
    });

    return await this.favoritesRepository.save(favorite);
  }

  async findAllByUser(userId: string, status?: FavoriteStatus) {
    const queryBuilder = this.favoritesRepository
      .createQueryBuilder('favorite')
      .leftJoinAndSelect('favorite.comic', 'comic')
      .where('favorite.userId = :userId', { userId });

    if (status) {
      queryBuilder.andWhere('favorite.status = :status', { status });
    }

    queryBuilder.orderBy('favorite.updatedAt', 'DESC');

    const favorites = await queryBuilder.getMany();

    return favorites.map((favorite) => ({
      id: favorite.id,
      comicId: favorite.comicId,
      status: favorite.status,
      createdAt: favorite.createdAt,
      updatedAt: favorite.updatedAt,
      comic: favorite.comic,
    }));
  }

  async findOne(userId: string, comicId: string) {
    const favorite = await this.favoritesRepository.findOne({
      where: { userId, comicId },
      relations: ['comic'],
    });

    return favorite;
  }

  async update(
    userId: string,
    comicId: string,
    updateFavoriteDto: UpdateFavoriteDto,
  ) {
    const favorite = await this.favoritesRepository.findOne({
      where: { userId, comicId },
    });

    if (!favorite) {
      throw new NotFoundException('未找到该收藏');
    }

    if (updateFavoriteDto.status) {
      favorite.status = updateFavoriteDto.status;
    }

    return await this.favoritesRepository.save(favorite);
  }

  async remove(userId: string, comicId: string) {
    const favorite = await this.favoritesRepository.findOne({
      where: { userId, comicId },
    });

    if (!favorite) {
      throw new NotFoundException('未找到该收藏');
    }

    await this.favoritesRepository.remove(favorite);

    return { message: '已取消收藏' };
  }

  async getStats(userId: string) {
    const total = await this.favoritesRepository.count({ where: { userId } });

    const reading = await this.favoritesRepository.count({
      where: { userId, status: FavoriteStatus.READING },
    });

    const wantRead = await this.favoritesRepository.count({
      where: { userId, status: FavoriteStatus.WANT_READ },
    });

    const completed = await this.favoritesRepository.count({
      where: { userId, status: FavoriteStatus.COMPLETED },
    });

    return {
      total,
      reading,
      wantRead,
      completed,
    };
  }
}
