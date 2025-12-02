import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTagDto {
  @ApiProperty({ description: '标签名称', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: '标签颜色', required: false })
  @IsString()
  @IsOptional()
  color?: string;
}
