import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagsController } from './tags.controller';
import { TagsService } from './tags.service';
import { Tag } from '../../entities/tag.entity';
import { Comic } from '../../entities/comic.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tag, Comic])],
  controllers: [TagsController],
  providers: [TagsService],
  exports: [TagsService],
})
export class TagsModule {}
