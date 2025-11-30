import { IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProgressDto {
  @ApiProperty({ description: '章节ID' })
  @IsString()
  chapterId: string;

  @ApiProperty({ description: '当前页码' })
  @IsNumber()
  @Min(0)
  currentPage: number;

  @ApiProperty({ description: '总页数' })
  @IsNumber()
  @Min(1)
  totalPages: number;
}
