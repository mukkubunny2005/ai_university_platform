import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private get accessSecret(): string {
    return (
      this.configService.get<string>('JWT_ACCESS_SECRET') ||
      'ai_university_phase1_super_secure_access_token_secret_key_2026'
    );
  }

  private get refreshSecret(): string {
    return (
      this.configService.get<string>('JWT_REFRESH_SECRET') ||
      'ai_university_phase1_super_secure_refresh_token_secret_key_2026'
    );
  }

  private get accessExpiresIn(): string {
    return this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m';
  }

  private get refreshExpiresIn(): string {
    return this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';
  }

  async generateTokens(userId: string, email: string, role: Role) {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.accessSecret,
        expiresIn: this.accessExpiresIn,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.refreshSecret,
        expiresIn: this.refreshExpiresIn,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async updateRefreshTokenHash(userId: string, refreshToken: string | null) {
    if (!refreshToken) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { refreshTokenHash: null },
      });
      return;
    }

    const hash = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: hash },
    });
  }

  async register(dto: RegisterDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Password and confirmation do not match');
    }

    if (dto.role === Role.ADMIN) {
      throw new ForbiddenException('Admin accounts cannot be created via public registration');
    }

    const normalizedEmail = dto.email.toLowerCase().trim();

    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new ConflictException('A user with this email address already exists');
    }

    if (dto.role === Role.STUDENT && dto.studentId) {
      const normalizedStudentId = dto.studentId.trim().toUpperCase();
      const existingStudent = await this.prisma.student.findUnique({
        where: { studentId: normalizedStudentId },
      });
      if (existingStudent) {
        throw new ConflictException(`Student ID "${normalizedStudentId}" is already assigned`);
      }
    }

    if (dto.role === Role.FACULTY && dto.facultyId) {
      const normalizedFacultyId = dto.facultyId.trim().toUpperCase();
      const existingFaculty = await this.prisma.faculty.findUnique({
        where: { facultyId: normalizedFacultyId },
      });
      if (existingFaculty) {
        throw new ConflictException(`Faculty ID "${normalizedFacultyId}" is already assigned`);
      }
    }

    if (!dto.departmentId) {
      throw new BadRequestException('Please select an academic department');
    }

    const deptExists = await this.prisma.department.findUnique({
      where: { id: dto.departmentId },
    });

    if (!deptExists) {
      throw new BadRequestException('The selected department does not exist');
    }

    const departmentId = deptExists.id;

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: dto.name.trim(),
          email: normalizedEmail,
          passwordHash,
          role: dto.role,
        },
      });

      if (dto.role === Role.STUDENT) {
        let studentId = dto.studentId ? dto.studentId.trim().toUpperCase() : null;
        if (!studentId) {
          let unique = false;
          while (!unique) {
            studentId = `STU-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
            const exists = await tx.student.findUnique({ where: { studentId } });
            if (!exists) unique = true;
          }
        }

        await tx.student.create({
          data: {
            userId: user.id,
            studentId,
            departmentId,
            semester: dto.semester || 1,
          },
        });
      } else if (dto.role === Role.FACULTY) {
        let facultyId = dto.facultyId ? dto.facultyId.trim().toUpperCase() : null;
        if (!facultyId) {
          let unique = false;
          while (!unique) {
            facultyId = `FAC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
            const exists = await tx.faculty.findUnique({ where: { facultyId } });
            if (!exists) unique = true;
          }
        }

        await tx.faculty.create({
          data: {
            userId: user.id,
            facultyId,
            departmentId,
            designation: dto.designation ? dto.designation.trim() : 'Assistant Professor',
          },
        });
      }

      return user;
    }, { maxWait: 10000, timeout: 15000 });

    const tokens = await this.generateTokens(result.id, result.email, result.role);
    await this.updateRefreshTokenHash(result.id, tokens.refreshToken);

    const fullUser = await this.getMe(result.id);

    return {
      message: 'Account registered successfully',
      data: {
        user: fullUser,
        tokens,
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
      include: {
        student: { include: { department: true } },
        faculty: { include: { department: true } },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

    const { passwordHash, refreshTokenHash, ...sanitizedUser } = user;

    return {
      message: 'Logged in successfully',
      data: {
        user: sanitizedUser,
        tokens,
      },
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.refreshSecret,
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.refreshTokenHash) {
        throw new UnauthorizedException('Access denied: invalid session or logged out');
      }

      const refreshTokenMatches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
      if (!refreshTokenMatches) {
        throw new UnauthorizedException('Access denied: invalid refresh token signature');
      }

      // Rotate tokens
      const tokens = await this.generateTokens(user.id, user.email, user.role);
      await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

      return {
        message: 'Tokens refreshed successfully',
        data: tokens,
      };
    } catch {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }
  }

  async logout(userId: string) {
    await this.updateRefreshTokenHash(userId, null);
    return {
      message: 'Logged out successfully',
      data: null,
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        student: {
          include: {
            department: {
              include: {
                courses: {
                  include: {
                    subjects: {
                      include: {
                        faculty: {
                          include: {
                            user: {
                              select: { name: true, email: true },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        faculty: {
          include: {
            department: {
              include: {
                courses: true,
              },
            },
            subjects: {
              include: {
                course: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User profile not found');
    }

    const { passwordHash, refreshTokenHash, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}
