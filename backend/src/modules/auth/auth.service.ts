import { Injectable, UnauthorizedException, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service'; // Import EmailService

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private emailService: EmailService, // Inject it
  ) {}

  // 1. REGISTER
  async register(dto: RegisterDto) {
    const existingUser = await this.usersService.findOne(dto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
    });

    return this.generateToken(user);
  }

  // 2. LOGIN
  async login(dto: LoginDto) {
    const user = await this.usersService.findOne(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.generateToken(user);
  }

  private generateToken(user: any) {
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }

  // 4. FORGOT PASSWORD (REAL EMAIL)
  async forgotPassword(email: string) {
    const user = await this.usersService.findOne(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await this.prisma.user.update({
      where: { email },
      data: { otp },
    });

    // SEND REAL EMAIL
    await this.emailService.sendOtp(email, otp);

    return { message: 'OTP sent to email' };
  }

  // 5. RESET PASSWORD
  async resetPassword(email: string, otp: string, newPassword: string) {
    const user = await this.usersService.findOne(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.otp !== otp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { email },
      data: { 
        password: hashedPassword,
        otp: null 
      },
    });

    return { message: 'Password successfully reset' };
  }
}