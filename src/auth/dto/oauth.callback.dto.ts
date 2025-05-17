import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class OAuthCallbackDto {
  @ApiProperty({ description: 'OAuth code from provider' })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({ required: false, description: 'Optional state parameter' })
  @IsNotEmpty()
  @IsString()
  state: string;

  @ApiPropertyOptional({ required: false, description: 'Optional scope parameter' })
  @IsOptional()
  @IsString()
  scope?: string;

  @ApiPropertyOptional({ required: false, description: 'Optional authuser parameter' })
  @IsOptional()
  @IsString()
  authuser?: string;

  @ApiPropertyOptional({ required: false, description: 'Optional prompt parameter' })
  @IsOptional()
  @IsString()
  prompt?: string;
}
