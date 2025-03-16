import { plainToClass } from 'class-transformer';
import { IsEnum, IsNumber, IsString, IsUrl, validateSync } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  PORT: number;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  JWT_SECRET: string;

  @IsString()
  JWT_EXPIRES_IN: string;

  @IsUrl({ require_tld: false })
  FRONTEND_URL: string;

  @IsNumber()
  BCRYPT_SALT_ROUNDS: number;

  @IsNumber()
  RATE_LIMIT_TTL: number;

  @IsNumber()
  RATE_LIMIT_MAX: number;

  @IsString()
  LOG_LEVEL: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, {
    ...config,
    PORT: parseInt(config.PORT as string, 10),
    BCRYPT_SALT_ROUNDS: parseInt(config.BCRYPT_SALT_ROUNDS as string, 10),
    RATE_LIMIT_TTL: parseInt(config.RATE_LIMIT_TTL as string, 10),
    RATE_LIMIT_MAX: parseInt(config.RATE_LIMIT_MAX as string, 10),
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
} 