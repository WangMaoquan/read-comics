import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Backup } from '../../entities/backup.entity';
import { CreateBackupDto } from './dto/create-backup.dto';
import * as path from 'path';

@Injectable()
export class BackupsService {
  constructor(
    @InjectRepository(Backup)
    private backupsRepository: Repository<Backup>,
  ) {}

  async create(createBackupDto: CreateBackupDto) {
    const backup = this.backupsRepository.create({
      ...createBackupDto,
      status: 'in_progress',
      filePath: `backups/${createBackupDto.name}.zip`,
    });

    const savedBackup = await this.backupsRepository.save(backup);

    // 异步执行备份（这里简化处理，实际应该用队列）
    this.performBackup(savedBackup.id).catch(console.error);

    return savedBackup;
  }

  private async performBackup(backupId: string) {
    const backup = await this.backupsRepository.findOne({
      where: { id: backupId },
    });
    if (!backup) return;

    try {
      // 这里模拟备份过程
      // 实际应该使用 archiver 压缩文件
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 模拟文件大小
      backup.size = Math.floor(Math.random() * 1000000000) + 100000000;
      backup.status = 'completed';
      await this.backupsRepository.save(backup);
    } catch (error) {
      backup.status = 'failed';
      await this.backupsRepository.save(backup);
    }
  }

  async findAll() {
    return this.backupsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    return this.backupsRepository.findOne({ where: { id } });
  }

  async remove(id: string) {
    const backup = await this.backupsRepository.findOne({ where: { id } });
    if (backup) {
      // 实际应该删除文件
      // const filePath = path.join(process.cwd(), backup.filePath);
      // await fs.remove(filePath).catch(() => {});

      await this.backupsRepository.delete(id);
    }
    return { deleted: true };
  }

  async getStats() {
    const total = await this.backupsRepository.count();
    const completed = await this.backupsRepository.count({
      where: { status: 'completed' },
    });
    const failed = await this.backupsRepository.count({
      where: { status: 'failed' },
    });
    const inProgress = await this.backupsRepository.count({
      where: { status: 'in_progress' },
    });

    const result = await this.backupsRepository
      .createQueryBuilder('backup')
      .select('SUM(backup.size)', 'totalSize')
      .where('backup.status = :status', { status: 'completed' })
      .getRawOne();

    const totalSize = parseInt(result?.totalSize || '0');

    return {
      total,
      completed,
      failed,
      inProgress,
      totalSize,
    };
  }
}
