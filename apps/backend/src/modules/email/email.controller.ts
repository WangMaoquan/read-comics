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
  async sendEmailCode(@Query('address') address) {
    const code = Math.random().toString(16).slice(2, 8);
    this.cacheManager.set(`code_${address}`, code);
    await this.emailService.sendMail({
      to: address,
      subject: '验证码',
      html: `<p>你的验证码为 ${code}</p`,
    });
  }
}
