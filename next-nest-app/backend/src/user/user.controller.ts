import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto, UserResponseDto } from '../dto/user.dto';

@ApiTags('사용자 API')
@Controller('users')
export class UserController {
  @Post()
  @ApiOperation({ summary: '사용자 생성', description: '새로운 사용자를 생성합니다.' })
  @ApiResponse({ status: 201, description: '사용자 생성 성공', type: UserResponseDto })
  async createUser(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // 실제로는 여기서 사용자를 생성하고 저장하는 로직이 들어갑니다.
    return {
      id: 1,
      email: createUserDto.email,
      name: createUserDto.name
    };
  }

  @Get()
  @ApiOperation({ summary: '사용자 목록 조회', description: '모든 사용자 목록을 조회합니다.' })
  @ApiResponse({ status: 200, description: '조회 성공', type: [UserResponseDto] })
  async getUsers(): Promise<UserResponseDto[]> {
    // 실제로는 여기서 사용자 목록을 조회하는 로직이 들어갑니다.
    return [
      {
        id: 1,
        email: 'user1@example.com',
        name: '홍길동'
      }
    ];
  }
} 