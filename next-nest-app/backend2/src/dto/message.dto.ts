import { ApiProperty } from '@nestjs/swagger';

export class MessageResponseDto {
  @ApiProperty({
    description: '응답 메시지',
    example: '안녕하세요! NestJS 백엔드입니다.',
  })
  message: string;
} 