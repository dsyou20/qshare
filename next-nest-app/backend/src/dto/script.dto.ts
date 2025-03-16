import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsInt, IsArray } from 'class-validator';

export class CreateScriptDto {
  @ApiProperty({ example: 'QGIS 레이어 스타일링 스크립트' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'layer = iface.activeLayer()\nif layer:\n    # 스타일링 로직' })
  @IsString()
  content: string;

  @ApiProperty({ example: '레이어의 스타일을 자동으로 설정하는 스크립트입니다.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}

export class UpdateScriptDto {
  @ApiProperty({ example: 'QGIS 레이어 스타일링 스크립트 v2' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ example: 'layer = iface.activeLayer()\nif layer:\n    # 수정된 스타일링 로직' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({ example: '레이어의 스타일을 더 효율적으로 설정하는 스크립트입니다.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}

export class ShareScriptDto {
  @ApiProperty({ example: [1, 2, 3] })
  @IsArray()
  @IsInt({ each: true })
  userIds: number[];
}

export class ScriptResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'QGIS 레이어 스타일링 스크립트' })
  title: string;

  @ApiProperty({ example: 'layer = iface.activeLayer()\nif layer:\n    # 스타일링 로직' })
  content: string;

  @ApiProperty({ example: '레이어의 스타일을 자동으로 설정하는 스크립트입니다.' })
  description?: string;

  @ApiProperty({ example: false })
  isPublic: boolean;

  @ApiProperty({ example: 42 })
  useCount: number;

  @ApiProperty({ example: 1 })
  authorId: number;

  @ApiProperty({ example: '2024-03-16T08:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-03-16T08:00:00.000Z' })
  updatedAt: Date;
} 