import { Controller, Get, UseGuards, Req, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { JwtPayload } from '../auth/types/jwt-payload.type';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UserProfileDto } from '../dto/user.dto';

interface RequestWithUser extends Request {
  user: JwtPayload;
}

@ApiTags('users')
@ApiBearerAuth('access-token')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiOperation({ summary: '내 프로필 조회', description: '현재 로그인한 사용자의 프로필 정보를 조회합니다.' })
  @ApiResponse({ status: 200, description: '프로필 조회 성공', type: UserProfileDto })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  async getProfile(@Req() req: RequestWithUser) {
    return this.usersService.findById(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('search')
  @ApiOperation({ summary: '사용자 검색', description: '이메일 또는 이름으로 다른 사용자를 검색합니다.' })
  @ApiQuery({ name: 'query', description: '검색어 (이메일 또는 이름)', required: true })
  @ApiResponse({ status: 200, description: '검색 성공', type: [UserProfileDto] })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  async searchUsers(@Query('query') query: string, @Req() req: RequestWithUser) {
    return this.usersService.searchUsers(query, req.user.sub);
  }
} 