import { Module } from '@nestjs/common';

import { IdsControllerModule } from './ids/ids.controller.module';

@Module({
  imports: [IdsControllerModule],
})
export class AppModule {}
