import { IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetStatsQueryDto {
  @ApiProperty({ required: false, description: '开始日期' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false, description: '结束日期' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    required: false,
    description: '时间粒度',
    enum: ['day', 'week', 'month'],
  })
  @IsOptional()
  @IsString()
  granularity?: 'day' | 'week' | 'month';
}
