import { UlidModule } from '@libs/service/ulid/ulid.module';
import { Module } from '@nestjs/common';

import { IdsController } from './ids.controller';

@Module({
  imports: [UlidModule],
  controllers: [IdsController],
})
export class IdsControllerModule {}
