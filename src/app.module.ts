import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';

import { IdsControllerModule } from './ids/ids.controller.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: path.join(process.cwd(), 'client'),
    }),
    IdsControllerModule,
  ],
})
export class AppModule {}
