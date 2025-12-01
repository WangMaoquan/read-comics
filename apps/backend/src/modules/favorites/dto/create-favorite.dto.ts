import { IsEnum, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FavoriteStatus } from '@entities/favorite.entity';

export class CreateFavoriteDto {
  @ApiProperty({ description: '漫画ID', example: 'uuid' })
  @IsUUID()
  comicId: string;

  @ApiProperty({
    description: '收藏状态',
    enum: FavoriteStatus,
    required: false,
    default: FavoriteStatus.READING,
  })
  @IsEnum(FavoriteStatus)
  @IsOptional()
  status?: FavoriteStatus;
}
