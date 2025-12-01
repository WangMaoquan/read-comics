import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from '@entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) {}

  async create(createTaskDto: CreateTaskDto) {
    const task = this.tasksRepository.create({
      ...createTaskDto,
      status: 'pending',
      progress: 0,
    });

    const savedTask = await this.tasksRepository.save(task);

    // 模拟异步任务执行 (实际项目中建议使用 Bull Queue)
    this.processTask(savedTask.id).catch(console.error);

    return savedTask;
  }

  private async processTask(taskId: string) {
    const task = await this.tasksRepository.findOne({ where: { id: taskId } });
    if (!task) return;

    try {
      // 更新状态为运行中
      task.status = 'running';
      task.startTime = new Date();
      await this.tasksRepository.save(task);

      // 模拟任务执行过程
      for (let i = 0; i <= 100; i += 10) {
        // 检查任务是否被取消
        const currentTask = await this.tasksRepository.findOne({
          where: { id: taskId },
        });
        if (!currentTask || currentTask.status === 'cancelled') {
          return;
        }

        task.progress = i;
        await this.tasksRepository.save(task);
        await new Promise((resolve) => setTimeout(resolve, 500)); // 模拟耗时
      }

      // 任务完成
      task.status = 'completed';
      task.endTime = new Date();
      task.result = { message: 'Task completed successfully' };
      await this.tasksRepository.save(task);
    } catch (error) {
      task.status = 'failed';
      task.error = error.message;
      task.endTime = new Date();
      await this.tasksRepository.save(task);
    }
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
    if (task && task.status === 'running') {
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

      this.processTask(savedTask.id).catch(console.error);
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
