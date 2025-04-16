import { Module } from '@nestjs/common';

import { IdsControllerModule } from './ids/ids.controller.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'), // index.html 경로
    }),
    // IdsControllerModule
  ],
})
export class AppModule {}
