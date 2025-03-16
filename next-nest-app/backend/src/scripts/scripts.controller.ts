import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ScriptsService } from './scripts.service';
import { CreateScriptDto } from './dto/create-script.dto';
import { UpdateScriptDto } from './dto/update-script.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ShareScriptDto } from './dto/share-script.dto';

@Controller('scripts')
@UseGuards(JwtAuthGuard)
export class ScriptsController {
  constructor(private readonly scriptsService: ScriptsService) {}

  @Post()
  create(@Body() createScriptDto: CreateScriptDto, @Request() req) {
    return this.scriptsService.create(createScriptDto, req.user.id);
  }

  @Get('my')
  findAll(@Request() req) {
    return this.scriptsService.findAll(req.user.id);
  }

  @Get('shared-with-me')
  findSharedWithMe(@Request() req) {
    return this.scriptsService.findSharedWithMe(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.scriptsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateScriptDto: UpdateScriptDto, @Request() req) {
    return this.scriptsService.update(id, updateScriptDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.scriptsService.remove(id, req.user.id);
  }

  @Post(':id/share')
  shareScript(@Param('id') id: string, @Body() shareScriptDto: ShareScriptDto, @Request() req) {
    return this.scriptsService.shareScript(id, shareScriptDto, req.user.id);
  }

  @Get(':id/shares')
  getShares(@Param('id') id: string, @Request() req) {
    return this.scriptsService.getShares(id, req.user.id);
  }

  @Delete(':id/share/:userId')
  removeShare(@Param('id') id: string, @Param('userId') userId: string, @Request() req) {
    return this.scriptsService.removeShare(id, parseInt(userId, 10), req.user.id);
  }
} 