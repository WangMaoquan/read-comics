import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SystemLogsService } from '@modules/system-logs/system-logs.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  constructor(private readonly systemLogsService: SystemLogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user, ip } = request;

    // 只记录修改性操作
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle().pipe(
        tap({
          next: async () => {
            try {
              // 忽略登录接口的日志，避免记录密码
              if (url.includes('/auth/login')) return;

              await this.systemLogsService.create({
                level: 'info',
                module: this.getModuleName(url),
                message: `${method} ${url}`,
                userId: user?.id,
                username: user?.username,
                ip: ip || request.connection.remoteAddress,
                metadata: {
                  // 简单的脱敏处理，实际应更复杂
                  body: body
                    ? JSON.stringify(body).substring(0, 1000)
                    : undefined,
                },
              });
            } catch (err) {
              this.logger.error('Failed to write system log', err);
            }
          },
        }),
      );
    }

    return next.handle();
  }

  private getModuleName(url: string): string {
    // url 格式通常为 /api/module/action
    const parts = url.split('/').filter(Boolean);
    // 如果有 api 前缀，取第二个，否则取第一个
    return parts[0] === 'api' ? parts[1] : parts[0] || 'system';
  }
}
