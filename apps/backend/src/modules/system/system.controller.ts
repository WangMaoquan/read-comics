import {
  Controller,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SystemService, ResetSystemResult } from './system.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Fixed import path
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';

@ApiTags('System')
@Controller('system')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SystemController {
  private readonly logger = new Logger(SystemController.name);

  constructor(private readonly systemService: SystemService) {}

  @Post('reset')
  @Roles('super_admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '重置系统',
    description:
      '清空所有数据(保留用户表)，包括：数据库表、user-upload目录下的ZIP文件、Redis缓存、S3文件。此操作不可逆，仅限super_admin访问。',
  })
  @ApiResponse({
    status: 200,
    description: '系统重置成功',
    schema: {
      example: {
        success: true,
        deletedCounts: {
          database: {
            readingProgress: 10,
            chapters: 50,
            userPreferences: 5,
            favorites: 15,
            comicTags: 20,
            comics: 5,
            tags: 10,
            backups: 3,
            tasks: 8,
            systemLogs: 100,
          },
          zipFiles: 5,
          s3Files: 150,
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '未授权 - 需要登录',
  })
  @ApiResponse({
    status: 403,
    description: '禁止访问 - 需要super_admin权限',
  })
  @ApiResponse({
    status: 500,
    description: '服务器错误',
  })
  async resetSystem(): Promise<ResetSystemResult> {
    this.logger.warn('System reset endpoint called');

    try {
      const result = await this.systemService.resetSystem();

      if (result.success) {
        this.logger.warn('System reset completed successfully');
      } else {
        this.logger.error('System reset completed with errors', result.errors);
      }

      return result;
    } catch (error) {
      this.logger.error('System reset failed', error.stack);
      throw error;
    }
  }
}
