import { UlidService } from '@libs/service/ulid/ulid.service';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('internal/ids')
@Controller('internal/ids')
export class IdsController {
  constructor(private readonly ulidService: UlidService) {}

  @Post()
  generateId(@Body('type') type: 'user' | 'image' | 'project') {
    return { id: this.ulidService.generate(type) };
  }
}
