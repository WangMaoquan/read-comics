import { Controller, Get, Inject, Query } from '@nestjs/common';
import { EmailService } from './email.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Controller('email')
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Get('code')
  async sendEmailCode(@Query('email') email) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.cacheManager.set(`code_${email}`, code);
    await this.emailService.sendMail({
      to: email,
      subject: '验证码',
      html: `<p>你的验证码为 ${code}</p`,
    });
  }
}
