import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ComicFormat, ComicStatus } from '@read-comics/types';

export class CreateComicDto {
  @ApiProperty({ description: '漫画标题' })
  @IsString()
  @IsNotEmpty()
  title: string;

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

  @ApiProperty({ description: '文件路径' })
  @IsString()
  @IsNotEmpty()
  filePath: string;

  @ApiProperty({ description: '文件大小(字节)' })
  @IsNumber()
  @IsNotEmpty()
  fileSize: number;

  @ApiProperty({ description: '文件格式', enum: ComicFormat })
  @IsEnum(ComicFormat)
  @IsNotEmpty()
  fileFormat: ComicFormat;

  @ApiProperty({ description: '文件哈希值(MD5)', required: false })
  @IsString()
  @IsOptional()
  hash?: string;

  @ApiProperty({ description: '总页数' })
  @IsNumber()
  @IsNotEmpty()
  totalPages: number;

  @ApiProperty({ description: '评分', required: false })
  @IsNumber()
  @IsOptional()
  rating?: number;

  @ApiProperty({ description: '状态', enum: ComicStatus, required: false })
  @IsEnum(ComicStatus)
  @IsOptional()
  status?: ComicStatus;

  @ApiProperty({
    description: '章节列表',
    required: false,
    type: 'array',
    items: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        pages: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  @IsOptional()
  chapters?: { title: string; pages: string[] }[];
}
