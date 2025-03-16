import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // API 프리픽스 설정 (Swagger 설정 전에 해야 함)
  app.setGlobalPrefix('api');
  
  // 전역 파이프 설정 (DTO 검증용)
  app.useGlobalPipes(new ValidationPipe());
  
  // CORS 설정
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('Next-Nest App API')
    .setDescription('Next.js와 NestJS를 사용한 애플리케이션의 API 문서')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(process.env.PORT || 3001);
  
  console.log(`애플리케이션이 시작되었습니다: ${await app.getUrl()}`);
  console.log(`Swagger 문서: ${await app.getUrl()}/swagger`);
}
bootstrap();
