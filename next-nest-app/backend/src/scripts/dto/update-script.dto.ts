import { PartialType } from '@nestjs/mapped-types';
import { CreateScriptDto } from './create-script.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateScriptDto extends PartialType(CreateScriptDto) {
  @ApiProperty({
    description: '스크립트 제목',
    example: 'QGIS 레이어 스타일 변경 스크립트 v2',
    required: false
  })
  title?: string;

  @ApiProperty({
    description: '스크립트 설명',
    example: '레이어의 심볼 색상을 변경하고 투명도를 조정하는 스크립트입니다. (수정된 버전)',
    required: false
  })
  description?: string;

  @ApiProperty({
    description: '스크립트 코드',
    example: 'layer = iface.activeLayer()\nrenderer = layer.renderer()\nfor symbol in renderer.symbols():\n    symbol.setColor(QColor(0, 255, 0))\n    symbol.setOpacity(0.8)',
    required: false
  })
  code?: string;

  @ApiProperty({
    description: '공개 여부',
    example: true,
    required: false
  })
  isPublic?: boolean;
}