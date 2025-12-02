import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTagDto {
  @ApiProperty({ description: '标签名称', example: '热血' })
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  name: string;

  @ApiProperty({
    description: '标签颜色',
    example: '#3b82f6',
    required: false,
  })
  @IsString()
  @IsOptional()
  color?: string;
}
