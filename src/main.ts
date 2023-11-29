import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Master Modules')
    .setDescription('The Default API description')
    .setVersion('1.0')
    .addTag('Default')
    .addBearerAuth({ type: 'http', name: 'token', in: 'header' }, 'authentication')
    .addServer("http://192.168.29.26:3000",'local server')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3000);
}
bootstrap();
