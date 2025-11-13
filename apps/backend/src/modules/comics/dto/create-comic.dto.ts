import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { ComicFormat, ComicStatus } from '@read-comics/types';

export class CreateComicDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  author?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  filePath: string;

  @IsNumber()
  @IsNotEmpty()
  fileSize: number;

  @IsEnum(ComicFormat)
  @IsNotEmpty()
  fileFormat: ComicFormat;

  @IsNumber()
  @IsNotEmpty()
  totalPages: number;

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
