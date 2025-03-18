import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ScriptsService } from './scripts.service';
import { CreateScriptDto } from './dto/create-script.dto';
import { UpdateScriptDto } from './dto/update-script.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ShareScriptDto } from './dto/share-script.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { ScriptResponseDto } from '../dto/script.dto';

@ApiTags('scripts')
@ApiBearerAuth('access-token')
@Controller('scripts')
@UseGuards(JwtAuthGuard)
export class ScriptsController {
  constructor(private readonly scriptsService: ScriptsService) {}

  @Post()
  @ApiOperation({ summary: '스크립트 생성', description: '새로운 QGIS 스크립트를 생성합니다.' })
  @ApiBody({ type: CreateScriptDto })
  @ApiResponse({ status: 201, description: '스크립트 생성 성공', type: ScriptResponseDto })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  create(@Body() createScriptDto: CreateScriptDto, @Request() req) {
    return this.scriptsService.create(createScriptDto, req.user.id);
  }

  @Get('my')
  @ApiOperation({ summary: '내 스크립트 목록 조회', description: '자신이 작성한 모든 스크립트 목록을 조회합니다.' })
  @ApiResponse({ status: 200, description: '조회 성공', type: [ScriptResponseDto] })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  findAll(@Request() req) {
    return this.scriptsService.findAll(req.user.id);
  }

  @Get('shared-with-me')
  @ApiOperation({ summary: '공유받은 스크립트 조회', description: '다른 사용자로부터 공유받은 스크립트 목록을 조회합니다.' })
  @ApiResponse({ status: 200, description: '조회 성공', type: [ScriptResponseDto] })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  findSharedWithMe(@Request() req) {
    return this.scriptsService.findSharedWithMe(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: '스크립트 상세 조회', description: '특정 스크립트의 상세 정보를 조회합니다.' })
  @ApiParam({ name: 'id', description: '스크립트 ID' })
  @ApiResponse({ status: 200, description: '조회 성공', type: ScriptResponseDto })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  @ApiResponse({ status: 403, description: '접근 권한 없음' })
  @ApiResponse({ status: 404, description: '스크립트를 찾을 수 없음' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.scriptsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '스크립트 수정', description: '기존 스크립트의 내용을 수정합니다.' })
  @ApiParam({ name: 'id', description: '스크립트 ID' })
  @ApiBody({ type: UpdateScriptDto })
  @ApiResponse({ status: 200, description: '수정 성공', type: ScriptResponseDto })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  @ApiResponse({ status: 403, description: '수정 권한 없음' })
  @ApiResponse({ status: 404, description: '스크립트를 찾을 수 없음' })
  update(@Param('id') id: string, @Body() updateScriptDto: UpdateScriptDto, @Request() req) {
    return this.scriptsService.update(id, updateScriptDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '스크립트 삭제', description: '스크립트를 삭제합니다.' })
  @ApiParam({ name: 'id', description: '스크립트 ID' })
  @ApiResponse({ status: 200, description: '삭제 성공' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  @ApiResponse({ status: 403, description: '삭제 권한 없음' })
  @ApiResponse({ status: 404, description: '스크립트를 찾을 수 없음' })
  remove(@Param('id') id: string, @Request() req) {
    return this.scriptsService.remove(id, req.user.id);
  }

  @Post(':id/share')
  @ApiOperation({ summary: '스크립트 공유', description: '스크립트를 다른 사용자와 공유합니다.' })
  @ApiParam({ name: 'id', description: '스크립트 ID' })
  @ApiBody({ type: ShareScriptDto })
  @ApiResponse({ status: 200, description: '공유 성공' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  @ApiResponse({ status: 403, description: '공유 권한 없음' })
  @ApiResponse({ status: 404, description: '스크립트를 찾을 수 없음' })
  shareScript(@Param('id') id: string, @Body() shareScriptDto: ShareScriptDto, @Request() req) {
    return this.scriptsService.shareScript(id, shareScriptDto, req.user.id);
  }

  @Get(':id/shares')
  @ApiOperation({ summary: '스크립트 공유 상태 조회', description: '스크립트가 어떤 사용자들과 공유되었는지 조회합니다.' })
  @ApiParam({ name: 'id', description: '스크립트 ID' })
  @ApiResponse({ status: 200, description: '조회 성공' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  @ApiResponse({ status: 403, description: '조회 권한 없음' })
  @ApiResponse({ status: 404, description: '스크립트를 찾을 수 없음' })
  getShares(@Param('id') id: string, @Request() req) {
    return this.scriptsService.getShares(id, req.user.id);
  }

  @Delete(':id/share/:userId')
  @ApiOperation({ summary: '스크립트 공유 취소', description: '특정 사용자와의 스크립트 공유를 취소합니다.' })
  @ApiParam({ name: 'id', description: '스크립트 ID' })
  @ApiParam({ name: 'userId', description: '공유 취소할 사용자 ID' })
  @ApiResponse({ status: 200, description: '공유 취소 성공' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  @ApiResponse({ status: 403, description: '취소 권한 없음' })
  @ApiResponse({ status: 404, description: '스크립트를 찾을 수 없음' })
  removeShare(@Param('id') id: string, @Param('userId') userId: string, @Request() req) {
    return this.scriptsService.removeShare(id, parseInt(userId, 10), req.user.id);
  }
} 