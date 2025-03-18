import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateScriptDto {
  @ApiProperty({
    description: '스크립트 제목',
    example: '레이어 심볼 스타일 변경',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: '스크립트 설명',
    example: '선택된 레이어의 모든 심볼 색상을 빨간색으로 변경하고 투명도를 70%로 설정합니다.',
    required: false
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: '스크립트 코드 (Python)',
    example: `# 현재 활성화된 레이어 가져오기
layer = iface.activeLayer()

# 레이어의 렌더러 가져오기
renderer = layer.renderer()

# 모든 심볼에 대해 색상과 투명도 설정
for symbol in renderer.symbols():
    # 빨간색으로 설정 (RGB: 255, 0, 0)
    symbol.setColor(QColor(255, 0, 0))
    # 투명도 70%로 설정 (0.7)
    symbol.setOpacity(0.7)

# 레이어 새로고침
layer.triggerRepaint()`,
    required: true
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    description: '공개 여부 (true: 모든 사용자에게 공개, false: 비공개)',
    example: false,
    required: false,
    default: false
  })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}