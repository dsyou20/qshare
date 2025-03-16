import { IsArray, IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class ShareScriptDto {
  @IsBoolean()
  @IsOptional()
  shareWithAll?: boolean;

  @IsArray()
  @IsOptional()
  @IsNumber({}, { each: true })
  userIds?: number[];
} 