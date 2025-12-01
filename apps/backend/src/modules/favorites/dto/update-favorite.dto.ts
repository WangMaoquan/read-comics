import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FavoriteStatus } from '@entities/favorite.entity';

export class UpdateFavoriteDto {
  @ApiProperty({
    description: '收藏状态',
    enum: FavoriteStatus,
    required: false,
  })
  @IsEnum(FavoriteStatus)
  @IsOptional()
  status?: FavoriteStatus;
}
