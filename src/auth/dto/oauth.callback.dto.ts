import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class OAuthCallbackDto {
  // @ApiProperty({
  //   enum: Object.values(OAUTH_PROVIDERS),
  //   description: 'OAuth provider',
  // }) // @IsNotEmpty()
  // // @IsIn(Object.values(OAUTH_PROVIDERS))
  // @IsString()
  // provider: OAuthProvider;

  @ApiProperty({ description: 'OAuth code from provider' }) @IsNotEmpty() @IsString() code: string;

  @ApiProperty({
    required: false,
    description: 'Optional state parameter',
  })
  @IsOptional()
  @IsString()
  state?: string;
}
