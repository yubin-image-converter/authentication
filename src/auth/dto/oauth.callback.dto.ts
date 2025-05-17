import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class OAuthCallbackDto {
  @ApiProperty({ description: 'OAuth code from provider' })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({ required: false, description: 'Optional state parameter' })
  @IsNotEmpty()
  @IsString()
  state: string;
}
