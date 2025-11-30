import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('users')
export class User {
  @ApiProperty({
    description: '用户唯一标识符',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '用户名', example: 'admin' })
  @Column({ unique: true })
  username: string;

  @ApiProperty({ description: '邮箱', example: 'user@example.com' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({
    description: '密码',
    example: 'password123',
    required: false,
  })
  @Column({ nullable: true })
  password?: string;

  @ApiProperty({
    description: '用户角色',
    example: 'user',
    enum: ['admin', 'user'],
    default: 'user',
  })
  @Column({ default: 'user' })
  role: string;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updatedAt: Date;
}
