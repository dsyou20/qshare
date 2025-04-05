import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SearchScriptDto {
  @ApiProperty({
    description: '검색 키워드 (제목, 설명, 태그, 내용에서 검색)',
    example: 'GIS',
    required: true
  })
  @IsString()
  keyword: string;
} 