import { OnApplicationBootstrap } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * httpAdapter 이용하여 부트스트랩 시 application 인스턴스를 가로채 swagger setting 진행
 * https://docs.nestjs.com/faq/http-adapter
 */
export class SwaggerConfigModule implements OnApplicationBootstrap {
  constructor(private readonly adapterHost: HttpAdapterHost) {}

  onApplicationBootstrap() {
    const app = this.adapterHost.httpAdapter.getInstance<NestExpressApplication>();

    const options = new DocumentBuilder()
      .setTitle('Authentication API')
      .setDescription('Auth service + ULID ID generator')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, options);

    SwaggerModule.setup('docs', app, document);
  }
}
