import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '@entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    @InjectQueue('tasks')
    private tasksQueue: Queue,
  ) {}

  async create(createTaskDto: CreateTaskDto) {
    const task = this.tasksRepository.create({
      ...createTaskDto,
      status: 'pending',
      progress: 0,
    });

    const savedTask = await this.tasksRepository.save(task);

    // 加入 BullMQ 队列
    await this.tasksQueue.add('execute', {
      taskId: savedTask.id,
      type: createTaskDto.type,
      params: createTaskDto.params,
    });

    return savedTask;
  }

  // 状态更新方法供 TasksProcessor 调用
  async updateStatus(id: string, status: Task['status']) {
    const update: Partial<Task> = { status };
    if (status === 'running') {
      update.startTime = new Date();
    }
    await this.tasksRepository.update(id, update);
  }

  async updateProgress(id: string, progress: number) {
    await this.tasksRepository.update(id, { progress });
  }

  async complete(id: string, result: any) {
    await this.tasksRepository.update(id, {
      status: 'completed',
      progress: 100,
      endTime: new Date(),
      result,
    });
  }

  async handleError(id: string, error: string) {
    await this.tasksRepository.update(id, {
      status: 'failed',
      error,
      endTime: new Date(),
    });
  }

  async findAll() {
    return this.tasksRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    return this.tasksRepository.findOne({ where: { id } });
  }

  async cancel(id: string) {
    const task = await this.tasksRepository.findOne({ where: { id } });
    if (task && (task.status === 'running' || task.status === 'pending')) {
      // 从队列中移除 (如果支持) 或 标记为取消
      // BullMQ 任务取消通常需要更复杂的逻辑，这里先简单更新状态
      task.status = 'cancelled';
      task.endTime = new Date();
      await this.tasksRepository.save(task);
    }
    return task;
  }

  async retry(id: string) {
    const task = await this.tasksRepository.findOne({ where: { id } });
    if (task && (task.status === 'failed' || task.status === 'cancelled')) {
      task.status = 'pending';
      task.progress = 0;
      task.error = undefined;
      task.startTime = undefined;
      task.endTime = undefined;
      const savedTask = await this.tasksRepository.save(task);

      await this.tasksQueue.add('execute', {
        taskId: savedTask.id,
        type: savedTask.type,
        params: savedTask.params,
      });

      return savedTask;
    }
    return task;
  }

  async remove(id: string) {
    await this.tasksRepository.delete(id);
    return { deleted: true };
  }

  async clearCompleted() {
    await this.tasksRepository.delete({ status: 'completed' });
    return { cleared: true };
  }

  async getStats() {
    const total = await this.tasksRepository.count();
    const running = await this.tasksRepository.count({
      where: { status: 'running' },
    });
    const pending = await this.tasksRepository.count({
      where: { status: 'pending' },
    });
    const completed = await this.tasksRepository.count({
      where: { status: 'completed' },
    });
    const failed = await this.tasksRepository.count({
      where: { status: 'failed' },
    });

    return { total, running, pending, completed, failed };
  }
}
