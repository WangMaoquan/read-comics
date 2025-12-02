import { IsString, IsIn, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBackupDto {
  @ApiProperty({ description: '备份名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '备份类型', enum: ['full', 'incremental'] })
  @IsIn(['full', 'incremental'])
  type: 'full' | 'incremental';

  @ApiProperty({ description: '备份描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
