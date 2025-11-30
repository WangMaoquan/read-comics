import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 全局前缀
  app.setGlobalPrefix('api');

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
  app.useGlobalInterceptors(new TransformInterceptor());

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
  console.log(`Application is running on: http://localhost:${port}/api`);
  console.log(`Swagger documentation: http://localhost:${port}/api/docs`);
}
bootstrap();
