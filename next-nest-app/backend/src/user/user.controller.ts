import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UserResponseDto } from '../dto/user.dto';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  @ApiOperation({ summary: '사용자 생성' })
  @ApiResponse({ status: 201, description: '사용자가 성공적으로 생성됨', type: UserResponseDto })
  async createUser(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const { password, ...userData } = createUserDto;
    return this.prisma.user.create({
      data: userData
    });
  }

  @Get()
  @ApiOperation({ summary: '사용자 목록 조회' })
  @ApiResponse({ status: 200, description: '사용자 목록을 성공적으로 조회함', type: [UserResponseDto] })
  async findAll(): Promise<UserResponseDto[]> {
    return this.prisma.user.findMany();
  }
} 