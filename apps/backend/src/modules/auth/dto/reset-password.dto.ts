import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ description: '邮箱' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: '验证码' })
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: '新密码' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
