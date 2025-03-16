import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { MessageResponseDto } from './dto/message.dto';

@ApiTags('기본 API')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: '기본 인사 메시지', description: '기본적인 환영 메시지를 반환합니다.' })
  @ApiResponse({ status: 200, description: '성공', type: String })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('hi')
  @ApiOperation({ summary: 'Hi 메시지', description: 'NestJS 백엔드의 인사 메시지를 반환합니다.' })
  @ApiResponse({ status: 200, description: '성공', type: MessageResponseDto })
  sayHi(): MessageResponseDto {
    return { message: '안녕하세요! NestJS 백엔드입니다.' };
  }
}

