import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
import { Comic } from './comic.entity';

export enum FavoriteStatus {
  READING = 'reading', // 正在阅读
  WANT_READ = 'want_read', // 想读
  COMPLETED = 'completed', // 已读完
}

@Entity('favorites')
export class Favorite {
  @ApiProperty({ description: '收藏唯一标识符' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '用户ID' })
  @Column()
  userId: string;

  @ApiProperty({ description: '漫画ID' })
  @Column()
  comicId: string;

  @ApiProperty({
    description: '收藏状态',
    enum: FavoriteStatus,
    default: FavoriteStatus.READING,
  })
  @Column({
    type: 'enum',
    enum: FavoriteStatus,
    default: FavoriteStatus.READING,
  })
  status: FavoriteStatus;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Comic)
  @JoinColumn({ name: 'comicId' })
  comic: Comic;
}
