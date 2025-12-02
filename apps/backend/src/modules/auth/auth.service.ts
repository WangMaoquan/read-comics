import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '@entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    // 检查用户是否已存在
    const existingUser = await this.usersRepository.findOne({
      where: [{ email: registerDto.email }, { username: registerDto.username }],
    });

    if (existingUser) {
      throw new UnauthorizedException('用户名或邮箱已存在');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // 检查是否是第一个用户，如果是则设为超级管理员
    const userCount = await this.usersRepository.count();
    const role = userCount === 0 ? 'super_admin' : 'user';

    // 创建用户
    const user = this.usersRepository.create({
      username: registerDto.username,
      email: registerDto.email,
      password: hashedPassword,
      role,
    });

    await this.usersRepository.save(user);

    // 生成 token
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };
    const token = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  async login(loginDto: LoginDto) {
    // 查找用户
    const user = await this.usersRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    // 生成 token
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };
    const token = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  private verificationCodes = new Map<
    string,
    { code: string; expires: number }
  >();

  async validateUser(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
  }

  async forgotPassword(email: string) {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('该邮箱未注册');
    }

    // 生成 6 位验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 存储验证码，有效期 10 分钟
    this.verificationCodes.set(email, {
      code,
      expires: Date.now() + 10 * 60 * 1000,
    });

    // TODO: 发送邮件
    console.log(`[Mock Email] To: ${email}, Code: ${code}`);

    return { message: '验证码已发送到您的邮箱' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { email, code, password } = resetPasswordDto;

    // 验证验证码
    const stored = this.verificationCodes.get(email);
    if (!stored || stored.code !== code || stored.expires < Date.now()) {
      throw new UnauthorizedException('验证码无效或已过期');
    }

    // 查找用户
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    // 重置密码
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await this.usersRepository.save(user);

    // 清除验证码
    this.verificationCodes.delete(email);

    return { message: '密码重置成功' };
  }
}
