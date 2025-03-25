import { Controller, Get, Put, Param, Body, UseGuards, NotFoundException } from '@nestjs/common';
import { AdminGuard } from '../guards/admin.guard';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('admin')
@ApiBearerAuth('access-token')
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private prisma: PrismaService) {}

  @ApiOperation({ summary: '모든 사용자 조회', description: '시스템의 모든 사용자 목록을 조회합니다.' })
  @ApiResponse({ 
    status: 200, 
    description: '사용자 목록 조회 성공',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          email: { type: 'string' },
          name: { type: 'string' },
          role: { type: 'string' },
          createdAt: { type: 'string' },
          updatedAt: { type: 'string' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  @ApiResponse({ status: 403, description: '관리자 권한 없음' })
  @Get('users')
  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  @ApiOperation({ summary: '관리자 권한 부여', description: '특정 사용자에게 관리자 권한을 부여합니다.' })
  @ApiParam({ name: 'id', description: '사용자 ID' })
  @ApiResponse({ 
    status: 200, 
    description: '관리자 권한 부여 성공',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        email: { type: 'string' },
        name: { type: 'string' },
        role: { type: 'string' },
        updatedAt: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  @ApiResponse({ status: 403, description: '관리자 권한 없음' })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
  @Put('users/:id/make-admin')
  async makeUserAdmin(@Param('id') id: string) {
    const userId = parseInt(id);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { role: 'ADMIN' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        updatedAt: true,
      },
    });
  }

  @ApiOperation({ summary: '사용자 비밀번호 변경', description: '관리자가 특정 사용자의 비밀번호를 변경합니다.' })
  @ApiParam({ name: 'id', description: '사용자 ID' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        newPassword: { type: 'string', description: '새로운 비밀번호' }
      },
      required: ['newPassword']
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: '비밀번호 변경 성공',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        email: { type: 'string' },
        name: { type: 'string' },
        role: { type: 'string' },
        updatedAt: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  @ApiResponse({ status: 403, description: '관리자 권한 없음' })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
  @Put('users/:id/change-password')
  async changeUserPassword(
    @Param('id') id: string,
    @Body('newPassword') newPassword: string,
  ) {
    const userId = parseInt(id);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    return this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        updatedAt: true,
      },
    });
  }

  @ApiOperation({ summary: '모든 스크립트 조회', description: '시스템의 모든 스크립트 목록을 조회합니다.' })
  @ApiResponse({ 
    status: 200, 
    description: '스크립트 목록 조회 성공',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          title: { type: 'string' },
          content: { type: 'string' },
          author: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              email: { type: 'string' },
              name: { type: 'string' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  @ApiResponse({ status: 403, description: '관리자 권한 없음' })
  @Get('scripts')
  async getAllScripts() {
    return this.prisma.script.findMany({
      include: {
        author: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  @ApiOperation({ summary: '시스템 통계 조회', description: '전체 사용자, 스크립트, 공유, 즐겨찾기 수를 조회합니다.' })
  @ApiResponse({ 
    status: 200, 
    description: '통계 조회 성공',
    schema: {
      type: 'object',
      properties: {
        totalUsers: { type: 'number', description: '전체 사용자 수' },
        totalScripts: { type: 'number', description: '전체 스크립트 수' },
        totalShares: { type: 'number', description: '전체 공유 수' },
        totalFavorites: { type: 'number', description: '전체 즐겨찾기 수' }
      }
    }
  })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  @ApiResponse({ status: 403, description: '관리자 권한 없음' })
  @Get('stats')
  async getStats() {
    const [totalUsers, totalScripts, totalShares, totalFavorites] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.script.count(),
      this.prisma.share.count(),
      this.prisma.favorite.count(),
    ]);

    return {
      totalUsers,
      totalScripts,
      totalShares,
      totalFavorites,
    };
  }
} 