import { Controller, Get, Put, Delete, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../decorators/user.decorator';
import { UserService } from './user.service';
import { UpdateUserDto, UserProfileDto, UserStatsDto } from '../dto/user.dto';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @ApiOperation({ summary: '내 프로필 조회' })
  @ApiResponse({ status: 200, type: UserProfileDto })
  async getProfile(@User('id') userId: number): Promise<UserProfileDto> {
    return this.userService.getProfile(userId);
  }

  @Get('stats')
  @ApiOperation({ summary: '내 통계 조회' })
  @ApiResponse({ status: 200, type: UserStatsDto })
  async getStats(@User('id') userId: number): Promise<UserStatsDto> {
    return this.userService.getStats(userId);
  }

  @Put('profile')
  @ApiOperation({ summary: '프로필 수정' })
  @ApiResponse({ status: 200, type: UserProfileDto })
  async updateProfile(
    @User('id') userId: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserProfileDto> {
    return this.userService.update(userId, updateUserDto);
  }

  @Delete('profile')
  @ApiOperation({ summary: '회원 탈퇴' })
  @ApiResponse({ status: 200, description: '회원 탈퇴 성공' })
  async deleteProfile(@User('id') userId: number): Promise<void> {
    return this.userService.delete(userId);
  }
} 