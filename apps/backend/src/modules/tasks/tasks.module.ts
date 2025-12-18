import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { Task } from '@entities/task.entity';
import { FilesModule } from '../files/files.module';
import { ComicsModule } from '../comics/comics.module';
import { SystemModule } from '../system/system.module';
import { ImagesModule } from '../images/images.module';
import { ChaptersModule } from '../chapters/chapters.module';
import { TasksProcessor } from './tasks.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task]),
    BullModule.registerQueue({
      name: 'tasks',
    }),
    FilesModule,
    ComicsModule,
    SystemModule,
    ImagesModule,
    ChaptersModule,
  ],
  controllers: [TasksController],
  providers: [TasksService, TasksProcessor],
  exports: [TasksService],
})
export class TasksModule {}
