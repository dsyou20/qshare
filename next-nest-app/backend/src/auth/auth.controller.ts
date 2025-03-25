import { Controller, Post, Body, UnauthorizedException, UseGuards, Get, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, TokenResponseDto } from '../dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Request } from 'express';
import { JwtPayload } from './types/jwt-payload.type';

interface RequestWithUser extends Request {
  user: JwtPayload;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: '회원 가입' })
  @ApiResponse({ 
    status: 201, 
    description: '회원 가입 성공 및 토큰 발급',
    type: TokenResponseDto 
  })
  async register(@Body() registerDto: RegisterDto): Promise<TokenResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: '로그인' })
  @ApiResponse({ 
    status: 200, 
    description: '로그인 성공 및 토큰 발급',
    type: TokenResponseDto 
  })
  async login(@Body() loginDto: LoginDto): Promise<TokenResponseDto> {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '인증 정보 확인', description: '현재 사용자의 JWT 토큰 정보를 확인합니다.' })
  @ApiResponse({ status: 200, description: '인증 정보 조회 성공' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  getProfile(@Req() req: RequestWithUser) {
    return req.user;
  }
} 