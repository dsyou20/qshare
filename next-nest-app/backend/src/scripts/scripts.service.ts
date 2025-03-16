import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScriptDto } from './dto/create-script.dto';
import { UpdateScriptDto } from './dto/update-script.dto';
import { ShareScriptDto } from './dto/share-script.dto';

@Injectable()
export class ScriptsService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async create(createScriptDto: CreateScriptDto, userId: number) {
    return this.prisma.script.create({
      data: {
        title: createScriptDto.title,
        content: createScriptDto.code,
        description: createScriptDto.description,
        isPublic: createScriptDto.isPublic,
        author: {
          connect: { id: userId }
        }
      },
      include: {
        author: true,
      },
    });
  }

  async findAll(userId: number) {
    return this.prisma.script.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        author: true,
      },
    });
  }

  async findSharedWithMe(userId: number) {
    return this.prisma.script.findMany({
      where: {
        OR: [
          { isPublic: true },
          {
            shares: {
              some: {
                userId: userId
              }
            }
          }
        ]
      },
      orderBy: { createdAt: 'desc' },
      include: {
        author: true,
        shares: {
          where: { userId },
          select: { id: true }
        }
      },
    });
  }

  async findOne(id: string, userId: number) {
    const scriptId = parseInt(id, 10);
    const script = await this.prisma.script.findFirst({
      where: { 
        id: scriptId,
        OR: [
          { authorId: userId },
          { isPublic: true },
          {
            shares: {
              some: {
                userId: userId
              }
            }
          }
        ]
      },
      include: {
        author: true,
        shares: true,
      },
    });

    if (!script) {
      throw new NotFoundException(`Script with ID ${id} not found or you don't have access to it`);
    }

    return script;
  }

  async update(id: string, updateScriptDto: UpdateScriptDto, userId: number) {
    const scriptId = parseInt(id, 10);
    
    // 스크립트 소유자 확인
    const script = await this.prisma.script.findUnique({
      where: { id: scriptId },
    });
    
    if (!script) {
      throw new NotFoundException(`Script with ID ${id} not found`);
    }
    
    if (script.authorId !== userId) {
      throw new ForbiddenException('You do not have permission to update this script');
    }
    
    return this.prisma.script.update({
      where: { id: scriptId },
      data: {
        title: updateScriptDto.title,
        content: updateScriptDto.code,
        description: updateScriptDto.description,
        isPublic: updateScriptDto.isPublic,
      },
      include: {
        author: true,
      },
    });
  }

  async remove(id: string, userId: number): Promise<void> {
    const scriptId = parseInt(id, 10);
    
    // 스크립트 소유자 확인
    const script = await this.prisma.script.findUnique({
      where: { id: scriptId },
    });
    
    if (!script) {
      throw new NotFoundException(`Script with ID ${id} not found`);
    }
    
    if (script.authorId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this script');
    }
    
    // 관련된 공유 정보도 함께 삭제
    await this.prisma.share.deleteMany({
      where: { scriptId },
    });
    
    await this.prisma.script.delete({
      where: { id: scriptId },
    });
  }

  async shareScript(id: string, shareScriptDto: ShareScriptDto, userId: number) {
    const scriptId = parseInt(id, 10);
    
    // 스크립트 소유자 확인
    const script = await this.prisma.script.findUnique({
      where: { id: scriptId },
    });
    
    if (!script) {
      throw new NotFoundException(`Script with ID ${id} not found`);
    }
    
    if (script.authorId !== userId) {
      throw new ForbiddenException('You do not have permission to share this script');
    }
    
    // 모든 사용자와 공유 (public 설정)
    if (shareScriptDto.shareWithAll) {
      await this.prisma.script.update({
        where: { id: scriptId },
        data: { isPublic: true },
      });
      return { success: true, message: '모든 사용자와 공유되었습니다.' };
    }
    
    // 특정 사용자들과 공유
    if (shareScriptDto.userIds && shareScriptDto.userIds.length > 0) {
      // 이미 공유된 사용자 필터링
      const existingShares = await this.prisma.share.findMany({
        where: {
          scriptId,
          userId: { in: shareScriptDto.userIds },
        },
        select: { userId: true },
      });
      
      const existingUserIds = existingShares.map(share => share.userId);
      const newUserIds = shareScriptDto.userIds.filter(id => !existingUserIds.includes(id));
      
      // 새로운 공유 생성
      if (newUserIds.length > 0) {
        await this.prisma.share.createMany({
          data: newUserIds.map(userId => ({
            scriptId,
            userId,
          })),
          skipDuplicates: true,
        });
      }
      
      return { 
        success: true, 
        message: `${newUserIds.length}명의 사용자와 공유되었습니다.`,
        sharedWith: shareScriptDto.userIds
      };
    }
    
    return { success: true, message: '변경사항이 없습니다.' };
  }

  async removeShare(id: string, targetUserId: number, userId: number) {
    const scriptId = parseInt(id, 10);
    
    // 스크립트 소유자 확인
    const script = await this.prisma.script.findUnique({
      where: { id: scriptId },
    });
    
    if (!script) {
      throw new NotFoundException(`Script with ID ${id} not found`);
    }
    
    if (script.authorId !== userId) {
      throw new ForbiddenException('You do not have permission to manage shares for this script');
    }
    
    // 공유 삭제
    await this.prisma.share.deleteMany({
      where: {
        scriptId,
        userId: targetUserId,
      },
    });
    
    return { success: true, message: '공유가 취소되었습니다.' };
  }

  async getShares(id: string, userId: number) {
    const scriptId = parseInt(id, 10);
    
    // 스크립트 소유자 확인
    const script = await this.prisma.script.findUnique({
      where: { id: scriptId },
      include: { author: true }
    });
    
    if (!script) {
      throw new NotFoundException(`Script with ID ${id} not found`);
    }
    
    if (script.authorId !== userId) {
      throw new ForbiddenException('You do not have permission to view shares for this script');
    }
    
    // 공유된 사용자 목록 조회
    const shares = await this.prisma.share.findMany({
      where: { scriptId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return {
      script: {
        id: script.id,
        title: script.title,
        isPublic: script.isPublic,
      },
      shares: shares.map(share => share.user)
    };
  }
} 