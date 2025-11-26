import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChapterDto {
  @ApiProperty({ description: '章节标题' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: '页码' })
  @IsNumber()
  @IsNotEmpty()
  pageNumber: number;

  @ApiProperty({ description: '图片路径' })
  @IsString()
  @IsNotEmpty()
  imagePath: string;

  @ApiProperty({ description: '所属漫画ID' })
  @IsString()
  @IsNotEmpty()
  comicId: string;
}
