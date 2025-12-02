import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Backup } from '@entities/backup.entity';
import { CreateBackupDto } from './dto/create-backup.dto';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as archiver from 'archiver';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BackupsService {
  private readonly logger = new Logger(BackupsService.name);
  private readonly uploadDir: string;
  private readonly backupDir: string;

  constructor(
    @InjectRepository(Backup)
    private backupsRepository: Repository<Backup>,
    private configService: ConfigService,
  ) {
    // 默认上传目录为 uploads，备份目录为 backups
    this.uploadDir = path.resolve(
      this.configService.get<string>('UPLOAD_DIR', 'uploads'),
    );
    this.backupDir = path.resolve(
      this.configService.get<string>('BACKUP_DIR', 'backups'),
    );
    this.ensureDirs();
  }

  private async ensureDirs() {
    try {
      await fs.ensureDir(this.uploadDir);
      await fs.ensureDir(this.backupDir);
    } catch (error) {
      this.logger.error('Failed to ensure directories', error);
    }
  }

  async create(createBackupDto: CreateBackupDto) {
    const fileName = `${createBackupDto.name}_${Date.now()}.zip`;
    const filePath = path.join(this.backupDir, fileName);
    // 存储相对路径或绝对路径，这里存储相对于项目根目录的路径以便后续处理
    const relativePath = path.relative(process.cwd(), filePath);

    const backup = this.backupsRepository.create({
      ...createBackupDto,
      status: 'in_progress',
      filePath: relativePath,
      size: 0,
    });

    const savedBackup = await this.backupsRepository.save(backup);

    // 异步执行备份
    this.performBackup(savedBackup.id, filePath).catch((err) => {
      this.logger.error(`Backup failed for ID ${savedBackup.id}`, err);
    });

    return savedBackup;
  }

  private async performBackup(backupId: string, destPath: string) {
    const backup = await this.backupsRepository.findOne({
      where: { id: backupId },
    });
    if (!backup) return;

    const output = fs.createWriteStream(destPath);
    const archive = archiver('zip', {
      zlib: { level: 9 }, // 最高压缩级别
    });

    return new Promise<void>((resolve, reject) => {
      output.on('close', async () => {
        this.logger.log(
          `Backup completed: ${backup.name} (${archive.pointer()} bytes)`,
        );
        backup.size = archive.pointer();
        backup.status = 'completed';
        await this.backupsRepository.save(backup);
        resolve();
      });

      archive.on('error', async (err) => {
        this.logger.error(`Backup error: ${backup.name}`, err);
        backup.status = 'failed';
        await this.backupsRepository.save(backup);
        reject(err);
      });

      archive.pipe(output);

      // 将上传目录的内容添加到 zip 中
      archive.directory(this.uploadDir, false);

      archive.finalize();
    });
  }

  async findAll() {
    return this.backupsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const backup = await this.backupsRepository.findOne({ where: { id } });
    if (!backup) {
      throw new NotFoundException(`Backup with ID ${id} not found`);
    }
    return backup;
  }

  async remove(id: string) {
    const backup = await this.backupsRepository.findOne({ where: { id } });
    if (backup) {
      // 删除物理文件
      const absolutePath = path.resolve(process.cwd(), backup.filePath);
      try {
        if (await fs.pathExists(absolutePath)) {
          await fs.remove(absolutePath);
        }
      } catch (error) {
        this.logger.warn(
          `Failed to delete backup file: ${absolutePath}`,
          error,
        );
      }

      await this.backupsRepository.remove(backup);
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
