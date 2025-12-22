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
import { LoggingConfig } from '@common/config/logging.config';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  constructor(private readonly systemLogsService: SystemLogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, body, query, params, headers, user, ip } = request;
    const userAgent = headers['user-agent'] || '';
    const startTime = Date.now();

    // 检查是否需要忽略此路径
    const shouldIgnore = LoggingConfig.ignoredPaths.some((pattern) =>
      pattern.test(url),
    );

    // 如果不启用详细日志或路径被忽略,只做基本处理
    if (!LoggingConfig.enableDetailedLogs || shouldIgnore) {
      return next.handle();
    }

    // 控制台日志 - 请求开始
    this.logRequest(method, url, {
      query,
      params,
      body,
      user,
      ip,
      userAgent,
    });

    return next.handle().pipe(
      tap({
        next: async (data) => {
          const endTime = Date.now();
          const duration = endTime - startTime;

          // 控制台日志 - 请求完成
          this.logResponse(method, url, response.statusCode, duration, data);

          // 只记录修改性操作到数据库
          if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            try {
              // 忽略登录接口的日志,避免记录密码
              if (url.includes('/auth/login')) return;

              await this.systemLogsService.create({
                level: 'info',
                module: this.getModuleName(url),
                message: `${method} ${url}`,
                userId: user?.id,
                username: user?.username,
                ip: ip || request.connection.remoteAddress,
                metadata: {
                  body: body
                    ? JSON.stringify(body).substring(0, 1000)
                    : undefined,
                  duration,
                  statusCode: response.statusCode,
                },
              });
            } catch (err) {
              this.logger.error('Failed to write system log', err);
            }
          }
        },
        error: (error) => {
          const endTime = Date.now();
          const duration = endTime - startTime;

          // 控制台日志 - 请求错误
          this.logError(method, url, error, duration);
        },
      }),
    );
  }

  /**
   * 打印请求日志
   */
  private logRequest(
    method: string,
    url: string,
    details: {
      query: any;
      params: any;
      body: any;
      user: any;
      ip: string;
      userAgent: string;
    },
  ) {
    const methodColor = this.getMethodColor(method);
    const timestamp = new Date().toLocaleString('zh-CN', {
      hour12: false,
    });

    // 构建日志信息
    const logParts = [
      `\n${'='.repeat(80)}`,
      `📥 [${timestamp}] ${methodColor}${method}\x1b[0m ${url}`,
    ];

    // 用户信息
    if (details.user) {
      logParts.push(
        `👤 User: ${details.user.username} (${details.user.id}) [${details.user.role}]`,
      );
    }

    // IP 地址
    if (details.ip) {
      logParts.push(`🌐 IP: ${details.ip}`);
    }

    // 查询参数
    if (details.query && Object.keys(details.query).length > 0) {
      logParts.push(`🔍 Query: ${JSON.stringify(details.query, null, 2)}`);
    }

    // 路由参数
    if (details.params && Object.keys(details.params).length > 0) {
      logParts.push(`📌 Params: ${JSON.stringify(details.params, null, 2)}`);
    }

    // 请求体 (排除敏感信息)
    if (details.body && Object.keys(details.body).length > 0) {
      const sanitizedBody = this.sanitizeBody(details.body);
      logParts.push(`📦 Body: ${JSON.stringify(sanitizedBody, null, 2)}`);
    }

    // User Agent (简化显示)
    if (details.userAgent) {
      const shortUA = this.getShortUserAgent(details.userAgent);
      logParts.push(`🖥️  Client: ${shortUA}`);
    }

    this.logger.log(logParts.join('\n'));
  }

  /**
   * 打印响应日志
   */
  private logResponse(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    data: any,
  ) {
    const methodColor = this.getMethodColor(method);
    const statusColor = this.getStatusColor(statusCode);
    const durationColor = this.getDurationColor(duration);

    const logParts = [
      `📤 Response: ${methodColor}${method}\x1b[0m ${url}`,
      `   ${statusColor}Status: ${statusCode}\x1b[0m | ${durationColor}Duration: ${duration}ms\x1b[0m`,
    ];

    // 如果响应数据不是太大,打印响应内容
    if (data) {
      const dataStr = JSON.stringify(data);
      if (dataStr.length < 500) {
        logParts.push(`   📄 Response Data: ${dataStr}`);
      } else {
        logParts.push(
          `   📄 Response Data: [Large response, ${dataStr.length} chars]`,
        );
      }
    }

    logParts.push(`${'='.repeat(80)}\n`);

    this.logger.log(logParts.join('\n'));
  }

  /**
   * 打印错误日志
   */
  private logError(method: string, url: string, error: any, duration: number) {
    const methodColor = this.getMethodColor(method);
    const durationColor = this.getDurationColor(duration);

    const logParts = [
      `❌ Error: ${methodColor}${method}\x1b[0m ${url}`,
      `   ${durationColor}Duration: ${duration}ms\x1b[0m`,
      `   🚨 Error: ${error.message || error}`,
    ];

    if (error.stack) {
      logParts.push(
        `   📚 Stack: ${error.stack.split('\n').slice(0, 3).join('\n   ')}`,
      );
    }

    logParts.push(`${'='.repeat(80)}\n`);

    this.logger.error(logParts.join('\n'));
  }

  /**
   * 获取 HTTP 方法的颜色
   */
  private getMethodColor(method: string): string {
    const colors: Record<string, string> = {
      GET: '\x1b[32m', // 绿色
      POST: '\x1b[33m', // 黄色
      PUT: '\x1b[34m', // 蓝色
      PATCH: '\x1b[35m', // 紫色
      DELETE: '\x1b[31m', // 红色
    };
    return colors[method] || '\x1b[37m'; // 默认白色
  }

  /**
   * 获取状态码的颜色
   */
  private getStatusColor(statusCode: number): string {
    if (statusCode >= 200 && statusCode < 300) return '\x1b[32m'; // 绿色
    if (statusCode >= 300 && statusCode < 400) return '\x1b[36m'; // 青色
    if (statusCode >= 400 && statusCode < 500) return '\x1b[33m'; // 黄色
    if (statusCode >= 500) return '\x1b[31m'; // 红色
    return '\x1b[37m'; // 白色
  }

  /**
   * 获取耗时的颜色
   */
  private getDurationColor(duration: number): string {
    if (duration < 100) return '\x1b[32m'; // 绿色 - 快
    if (duration < 500) return '\x1b[33m'; // 黄色 - 中等
    return '\x1b[31m'; // 红色 - 慢
  }

  /**
   * 脱敏处理请求体
   */
  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') return body;

    const sanitized = { ...body };

    for (const field of LoggingConfig.sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    }

    return sanitized;
  }

  /**
   * 简化 User Agent 显示
   */
  private getShortUserAgent(userAgent: string): string {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Postman')) return 'Postman';
    if (userAgent.includes('curl')) return 'curl';
    if (userAgent.includes('axios')) return 'axios';
    return userAgent.substring(0, 50);
  }

  /**
   * 获取模块名称
   */
  private getModuleName(url: string): string {
    const parts = url.split('/').filter(Boolean);
    return parts[0] === 'api' ? parts[1] : parts[0] || 'system';
  }
}
