import {
  Controller,
  Get,
  Inject,
  Query,
  BadRequestException,
  InternalServerErrorException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { EmailService } from './email.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@ApiTags('Email')
@Controller('email')
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Get('code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '发送邮箱验证码',
    description: '向指定邮箱发送6位数字验证码，验证码将缓存在Redis中',
  })
  @ApiQuery({
    name: 'email',
    description: '接收验证码的邮箱地址',
    required: true,
    type: String,
    example: 'user@example.com',
  })
  @ApiResponse({
    status: 200,
    description: '验证码发送成功',
    schema: {
      example: {
        message: '验证码已发送',
        email: 'user@example.com',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '邮箱地址无效',
  })
  @ApiResponse({
    status: 500,
    description: '邮件发送失败',
  })
  async sendEmailCode(@Query('email') email: string) {
    // 验证邮箱格式
    if (!email || !this.isValidEmail(email)) {
      throw new BadRequestException('邮箱地址无效');
    }

    try {
      // 生成6位数字验证码
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      // 缓存验证码，设置5分钟过期时间
      await this.cacheManager.set(`code_${email}`, code, 5 * 60 * 1000);

      // 发送邮件
      await this.emailService.sendMail({
        to: email,
        subject: '验证码',
        html: `<p>你的验证码为 ${code}</p><p>验证码有效期为5分钟</p>`,
      });

      return {
        message: '验证码已发送',
        email,
      };
    } catch (error) {
      throw new InternalServerErrorException('邮件发送失败，请稍后重试');
    }
  }

  /**
   * 验证邮箱格式
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
