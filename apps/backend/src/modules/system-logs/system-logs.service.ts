import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { SystemLog } from '@entities/system-log.entity';
import { QuerySystemLogsDto } from './dto/query-system-logs.dto';

@Injectable()
export class SystemLogsService {
  constructor(
    @InjectRepository(SystemLog)
    private logsRepository: Repository<SystemLog>,
  ) {}

  async create(logData: Partial<SystemLog>): Promise<SystemLog> {
    const log = this.logsRepository.create(logData);
    return this.logsRepository.save(log);
  }

  async findAll(query: QuerySystemLogsDto) {
    const {
      search,
      level,
      module,
      startDate,
      endDate,
      page = 1,
      pageSize = 10,
    } = query;
    const where: any = {};

    if (level) where.level = level;
    if (module) where.module = module;
    if (search) {
      where.message = Like(`%${search}%`);
    }
    if (startDate && endDate) {
      where.createdAt = Between(new Date(startDate), new Date(endDate));
    }

    const [data, total] = await this.logsRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getStats() {
    const total = await this.logsRepository.count();
    const info = await this.logsRepository.count({ where: { level: 'info' } });
    const warn = await this.logsRepository.count({ where: { level: 'warn' } });
    const error = await this.logsRepository.count({
      where: { level: 'error' },
    });
    const debug = await this.logsRepository.count({
      where: { level: 'debug' },
    });

    return { total, info, warn, error, debug };
  }

  async clearAll(): Promise<void> {
    await this.logsRepository.clear();
  }
}
