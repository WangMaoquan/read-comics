import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Comic } from '@entities/comic.entity';
import { User } from '@entities/user.entity';
import { GetStatsQueryDto } from './dto/get-stats-query.dto';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Comic)
    private comicsRepository: Repository<Comic>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * 获取总览统计
   */
  async getOverview() {
    const totalComics = await this.comicsRepository.count();
    const totalUsers = await this.usersRepository.count();

    // 计算本周新增漫画
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const newComicsThisWeek = await this.comicsRepository.count({
      where: {
        createdAt: Between(weekAgo, new Date()),
      },
    });

    // 计算总阅读次数
    const result = await this.comicsRepository
      .createQueryBuilder('comic')
      .select('SUM(comic.readCount)', 'total')
      .getRawOne();
    const totalReads = parseInt(result?.total || '0');

    // Mock 其他数据
    const activeUsers = Math.floor(totalUsers * 0.3); // 30% 活跃用户
    const storageUsed = '45.2 GB'; // Mock 数据

    return {
      totalComics,
      totalUsers,
      newComicsThisWeek,
      activeUsers,
      totalReads,
      storageUsed,
    };
  }

  /**
   * 获取漫画趋势数据
   */
  async getComicsTrend(query: GetStatsQueryDto) {
    const { startDate, endDate, granularity = 'day' } = query;

    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // 按日期分组统计
    const comics = await this.comicsRepository
      .createQueryBuilder('comic')
      .select('DATE(comic.createdAt)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('comic.createdAt BETWEEN :start AND :end', { start, end })
      .groupBy('DATE(comic.createdAt)')
      .orderBy('date', 'ASC')
      .getRawMany();

    return comics.map((item) => ({
      date: item.date,
      count: parseInt(item.count),
    }));
  }

  /**
   * 获取热门漫画
   */
  async getTopComics(limit: number = 10) {
    return this.comicsRepository.find({
      order: {
        readCount: 'DESC',
      },
      take: limit,
      select: ['id', 'title', 'author', 'readCount', 'rating', 'cover'],
    });
  }

  /**
   * 获取存储统计
   */
  async getStorageStats() {
    const result = await this.comicsRepository
      .createQueryBuilder('comic')
      .select('SUM(comic.fileSize)', 'totalSize')
      .addSelect('COUNT(*)', 'count')
      .addSelect('AVG(comic.fileSize)', 'avgSize')
      .getRawOne();

    const totalSize = parseInt(result?.totalSize || '0');
    const count = parseInt(result?.count || '0');
    const avgSize = parseInt(result?.avgSize || '0');

    // Mock 分布数据
    const distribution = [
      { name: 'Comics', value: totalSize * 0.85 },
      { name: 'Cache', value: totalSize * 0.1 },
      { name: 'Thumbnails', value: totalSize * 0.05 },
    ];

    return {
      totalSize,
      count,
      avgSize,
      distribution,
    };
  }

  /**
   * 获取用户活跃度统计
   */
  async getUserActivity(query: GetStatsQueryDto) {
    const totalUsers = await this.usersRepository.count();

    // Mock 活跃度数据
    const activityData: { date: string; activeUsers: number }[] = [];
    const days = 7;
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      activityData.push({
        date: date.toISOString().split('T')[0],
        activeUsers:
          Math.floor(Math.random() * (totalUsers * 0.5)) + totalUsers * 0.2,
      });
    }

    return activityData;
  }
}
