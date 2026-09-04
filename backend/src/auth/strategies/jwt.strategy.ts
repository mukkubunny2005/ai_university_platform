import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_ACCESS_SECRET') ||
        'ai_university_phase1_super_secure_access_token_secret_key_2026',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        student: {
          include: {
            department: true,
          },
        },
        faculty: {
          include: {
            department: true,
            subjects: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User account not found or token expired');
    }

    // Do not leak passwordHash or refreshTokenHash
    const { passwordHash, refreshTokenHash, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}
