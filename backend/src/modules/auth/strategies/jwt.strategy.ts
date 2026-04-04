import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'fallback-secret-key-min-32-chars-long',
    });
  }

  async validate(payload: { userId: number; email: string; role?: string }) {
    if (!payload?.userId || !payload?.email) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId, email: payload.email },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (!user) throw new UnauthorizedException('User not found or token mismatch');
    if (!user.isActive) throw new UnauthorizedException('Account is deactivated');

    return { userId: user.id, email: user.email, role: user.role };
  }
}