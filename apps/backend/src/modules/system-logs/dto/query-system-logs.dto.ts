import {
  IsString,
  IsOptional,
  IsIn,
  IsDateString,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class QuerySystemLogsDto {
  @ApiProperty({ required: false, description: '搜索关键词' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    required: false,
    description: '日志级别',
    enum: ['info', 'warn', 'error', 'debug'],
  })
  @IsOptional()
  @IsIn(['info', 'warn', 'error', 'debug'])
  level?: string;

  @ApiProperty({ required: false, description: '模块名称' })
  @IsOptional()
  @IsString()
  module?: string;

  @ApiProperty({ required: false, description: '开始日期' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false, description: '结束日期' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ required: false, description: '页码', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @ApiProperty({ required: false, description: '每页数量', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pageSize?: number;
}
