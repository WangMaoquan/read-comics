import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: '用户名', example: 'admin' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: '密码',
    example: 'password123',
    required: false,
  })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty({
    description: '用户角色',
    example: 'user',
    enum: ['admin', 'user'],
    default: 'user',
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsIn(['admin', 'user'])
  role?: 'admin' | 'user';
}
