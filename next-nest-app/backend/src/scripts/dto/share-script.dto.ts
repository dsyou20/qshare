import { IsArray, IsBoolean, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ShareScriptDto {
  @ApiProperty({ 
    description: '모든 사용자와 공유 여부 (public 설정)', 
    example: false,
    required: false
  })
  @IsBoolean()
  @IsOptional()
  shareWithAll?: boolean;

  @ApiProperty({ 
    description: '공유할 사용자 ID 목록', 
    example: [1, 2, 3],
    required: false,
    type: [Number]
  })
  @IsArray()
  @IsOptional()
  @IsNumber({}, { each: true })
  userIds?: number[];
} 