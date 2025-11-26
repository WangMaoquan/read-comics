import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  // 启用全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 自动移除非装饰属性
      forbidNonWhitelisted: true, // 当遇到非白名单属性时抛出错误
      transform: true, // 自动转换类型
    }),
  );

  // 配置 Swagger
  const config = new DocumentBuilder()
    .setTitle('漫画阅读器 API')
    .setDescription('漫画阅读器后端 API 文档')
    .setVersion('1.0')
    .addTag('comics', '漫画管理')
    .addTag('files', '文件管理')
    .addTag('images', '图片处理')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
  console.log(
    `Application is running on: http://localhost:${process.env.PORT ?? 3000}`,
  );
  console.log(
    `Swagger documentation: http://localhost:${process.env.PORT ?? 3000}/api`,
  );
}
bootstrap();
