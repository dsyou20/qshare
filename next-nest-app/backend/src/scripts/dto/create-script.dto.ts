import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateScriptDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
} 