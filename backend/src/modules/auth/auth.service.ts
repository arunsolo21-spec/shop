import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export interface GoogleSignInDto {
  idToken: string;
  accessToken: string;
  name: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async login(loginDto: LoginDto) {
    if (!loginDto?.email || !loginDto?.password) {
      throw new BadRequestException('Email and password are required');
    }

    const user = await this.usersService.findOne(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const token = this.jwtService.sign(tokenPayload, {
      expiresIn: '7d',
    });

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    if (!registerDto?.email || !registerDto?.password || !registerDto?.name) {
      throw new BadRequestException('Name, email, and password are required');
    }

    const existingUser = await this.usersService.findOne(registerDto.email);

    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.usersService.create({
      email: registerDto.email,
      password: hashedPassword,
      name: registerDto.name,
      phone: registerDto.phone || '',
    });

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const token = this.jwtService.sign(tokenPayload, {
      expiresIn: '7d',
    });

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    };
  }

  async googleSignIn(googleSignInDto: GoogleSignInDto) {
    const { idToken, accessToken, name, email } = googleSignInDto;

    if (!idToken || !email) {
      throw new BadRequestException('Google ID token and email are required');
    }

    const googleUser = await this.verifyGoogleToken(idToken);

    if (!googleUser) {
      throw new UnauthorizedException('Invalid Google token');
    }

    if (googleUser.email !== email) {
      throw new UnauthorizedException('Email mismatch');
    }

    let user = await this.usersService.findOne(email);

    if (!user) {
      const hashedPassword = await bcrypt.hash(Math.random().toString(36).slice(-8), 10);
      user = await this.usersService.create({
        email: googleUser.email,
        password: hashedPassword,
        name: googleUser.name || name,
        phone: '',
        profileImage: googleUser.picture,
      });
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const token = this.jwtService.sign(tokenPayload, {
      expiresIn: '7d',
    });

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage,
      },
    };
  }

  private async verifyGoogleToken(idToken: string) {
    try {
      const { OAuth2Client } = await import('google-auth-library');
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
      const ticket = await client.verifyIdToken({
        idToken: idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      return ticket.getPayload();
    } catch (error) {
      console.error('Google token verification failed:', error);
      return null;
    }
  }

  async forgotPassword(email: string) {
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    const user = await this.usersService.findOne(email);

    if (!user) {
      throw new BadRequestException('Email not found');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.prisma.user.update({
      where: { email },
      data: {
        otp,
        otpExpiresAt,
      },
    });

    const emailSent = await this.emailService.sendOtp(email, otp);

    if (!emailSent) {
      throw new BadRequestException('Failed to send OTP email');
    }

    return { message: 'OTP sent to email' };
  }

  async resetPassword(email: string, token: string, newPassword: string) {
    if (!email || !token || !newPassword) {
      throw new BadRequestException('Email, token, and new password are required');
    }

    if (newPassword.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters');
    }

    const user = await this.usersService.findOne(email);

    if (!user) {
      throw new BadRequestException('Email not found');
    }

    if (user.otp !== token) {
      throw new BadRequestException('Invalid OTP');
    }

    if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
      throw new BadRequestException('OTP has expired');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        otp: null,
        otpExpiresAt: null,
      },
    });

    return { message: 'Password reset successful' };
  }

  async validateUser(userId: number) {
    const response = await this.usersService.findById(userId);
    const user = response.data;

    if (!user || !user.isActive) {
      return null;
    }

    return {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
  }
}