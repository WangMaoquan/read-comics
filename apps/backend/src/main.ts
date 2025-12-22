import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
// import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 安全头部
  app.use(
    helmet({
      crossOriginResourcePolicy: false, // 允许跨域加载图片
      contentSecurityPolicy: false, // 简单起见，关闭 CSP 以免阻塞 Swagger 或某些前端加载，后续可精细配置
    }),
  );

  // 全局前缀 - 已移除
  // app.setGlobalPrefix('api');

  // 允许跨域
  app.enableCors();

  // 全局管道 - 验证 DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 全局拦截器 - 统一响应格式
  // app.useGlobalInterceptors(new TransformInterceptor());

  // 全局过滤器 - 统一异常处理
  app.useGlobalFilters(new AllExceptionsFilter());

  // Swagger 文档配置
  const config = new DocumentBuilder()
    .setTitle('漫画阅读器 API')
    .setDescription('漫画阅读器后端 API 文档')
    .setVersion('1.0')
    .addTag('comics', '漫画管理')
    .addTag('files', '文件管理')
    .addTag('images', '图片处理')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  // 增强的启动信息
  console.log('\n' + '='.repeat(80));
  console.log('🚀 \x1b[32m漫画阅读器后端服务启动成功!\x1b[0m');
  console.log('='.repeat(80));
  console.log(
    `📅 启动时间: ${new Date().toLocaleString('zh-CN', { hour12: false })}`,
  );
  console.log(
    `🌍 运行环境: \x1b[33m${process.env.NODE_ENV || 'development'}\x1b[0m`,
  );
  console.log(`📡 服务地址: \x1b[36mhttp://localhost:${port}\x1b[0m`);
  console.log(`📚 API 文档: \x1b[36mhttp://localhost:${port}/api/docs\x1b[0m`);
  console.log(`📊 健康检查: \x1b[36mhttp://localhost:${port}/health\x1b[0m`);
  console.log('\n📋 配置信息:');
  console.log(
    `   - 数据库: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}`,
  );
  console.log(
    `   - Redis: ${process.env.REDIS_LINK ? '✅ 已配置' : '❌ 未配置'}`,
  );
  console.log(
    `   - S3 存储: ${process.env.RUSTFS_ENDPOINT_URL ? '✅ 已配置' : '❌ 未配置'}`,
  );
  console.log(
    `   - 邮件服务: ${process.env.EMAIL_HOST ? '✅ 已配置' : '❌ 未配置'}`,
  );
  console.log(
    `   - 详细日志: ${process.env.NODE_ENV !== 'production' ? '\x1b[32m✅ 已启用\x1b[0m' : '\x1b[33m❌ 已禁用\x1b[0m'}`,
  );
  console.log('='.repeat(80) + '\n');
}
bootstrap();
