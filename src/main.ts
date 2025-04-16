import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';
import { AppModule } from './app.module';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Authentication API')
    .setDescription('Auth service + ULID ID generator')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const clientPath = path.join(__dirname, '..', 'client');

  // 정적 파일 서빙 (HTML, CSS, JS)
  app.useStaticAssets(clientPath);

  // 👇👇 여기가 핵심 👇👇
  // Nest의 라우팅이 아니라 Express 레벨에서 fallback 처리
  app.use('/', express.static(clientPath));
  app.use((req, res, next) => {
    res.sendFile(path.join(clientPath, 'index.html'));
  });

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
