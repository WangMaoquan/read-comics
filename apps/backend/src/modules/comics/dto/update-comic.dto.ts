import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { ComicStatus } from '@read-comics/types';

export class UpdateComicDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  author?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsNumber()
  @IsOptional()
  rating?: number;

  @IsEnum(ComicStatus)
  @IsOptional()
  status?: ComicStatus;
}
