import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ComicStatus } from '@read-comics/types';

export class UpdateComicDto {
  @ApiProperty({ description: '漫画标题', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: '作者', required: false })
  @IsString()
  @IsOptional()
  author?: string;

  @ApiProperty({ description: '描述', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: '标签', required: false, type: [String] })
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiProperty({ description: '评分', required: false })
  @IsNumber()
  @IsOptional()
  rating?: number;

  @ApiProperty({ description: '状态', enum: ComicStatus, required: false })
  @IsEnum(ComicStatus)
  @IsOptional()
  status?: ComicStatus;
}
