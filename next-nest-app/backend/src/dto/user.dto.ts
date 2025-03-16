import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

// 사용자 생성 요청 DTO
export class CreateUserDto {
  @ApiProperty({
    description: '사용자 이메일',
    example: 'user@example.com'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: '사용자 이름',
    example: '홍길동'
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: '비밀번호 (최소 6자)',
    example: 'password123'
  })
  @IsString()
  @MinLength(6)
  password: string;
}

// 사용자 응답 DTO (비밀번호 제외)
export class UserResponseDto {
  @ApiProperty({
    description: '사용자 ID',
    example: 1
  })
  id: number;

  @ApiProperty({
    description: '사용자 이메일',
    example: 'user@example.com'
  })
  email: string;

  @ApiProperty({
    description: '사용자 이름',
    example: '홍길동'
  })
  name?: string;

  @ApiProperty({
    description: '생성일',
    example: '2024-03-16T08:00:00.000Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: '수정일',
    example: '2024-03-16T08:00:00.000Z'
  })
  updatedAt: Date;
}

export class UpdateUserDto {
  @ApiProperty({
    description: '사용자 이름',
    example: '홍길동'
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: '비밀번호 (최소 6자)',
    example: 'newpassword123'
  })
  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;
}

export class UserProfileDto {
  @ApiProperty({
    description: '사용자 ID',
    example: 1
  })
  id: number;

  @ApiProperty({
    description: '사용자 이메일',
    example: 'user@example.com'
  })
  email: string;

  @ApiProperty({
    description: '사용자 이름',
    example: '홍길동'
  })
  name: string;

  @ApiProperty({
    description: '생성일',
    example: '2024-03-16T08:00:00.000Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: '수정일',
    example: '2024-03-16T08:00:00.000Z'
  })
  updatedAt: Date;
}

export class UserStatsDto {
  @ApiProperty({
    description: '전체 스크립트 수',
    example: 5
  })
  totalScripts: number;

  @ApiProperty({
    description: '공개 스크립트 수',
    example: 3
  })
  publicScripts: number;

  @ApiProperty({
    description: '비공개 스크립트 수',
    example: 2
  })
  privateScripts: number;

  @ApiProperty({
    description: '공유받은 스크립트 수',
    example: 10
  })
  sharedWithMe: number;

  @ApiProperty({
    description: '즐겨찾기한 스크립트 수',
    example: 8
  })
  favorites: number;
} 