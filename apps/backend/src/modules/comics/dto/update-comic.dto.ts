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

  @ApiProperty({ description: '封面路径', required: false })
  @IsString()
  @IsOptional()
  cover?: string;

  @ApiProperty({ description: '评分', required: false })
  @IsNumber()
  @IsOptional()
  rating?: number;

  @ApiProperty({ description: '状态', enum: ComicStatus, required: false })
  @IsEnum(ComicStatus)
  @IsOptional()
  status?: ComicStatus;

  @ApiProperty({ description: '文件哈希值', required: false })
  @IsString()
  @IsOptional()
  hash?: string;
}
