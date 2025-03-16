import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScriptDto } from './dto/create-script.dto';
import { UpdateScriptDto } from './dto/update-script.dto';

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

  async findOne(id: string, userId: number) {
    const scriptId = parseInt(id, 10);
    const script = await this.prisma.script.findFirst({
      where: { 
        id: scriptId,
        authorId: userId,
      },
      include: {
        author: true,
      },
    });

    if (!script) {
      throw new NotFoundException(`Script with ID ${id} not found`);
    }

    return script;
  }

  async update(id: string, updateScriptDto: UpdateScriptDto, userId: number) {
    const scriptId = parseInt(id, 10);
    await this.findOne(id, userId); // 존재 여부 확인
    
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
    await this.findOne(id, userId); // 존재 여부 확인
    
    await this.prisma.script.delete({
      where: { id: scriptId },
    });
  }
} 