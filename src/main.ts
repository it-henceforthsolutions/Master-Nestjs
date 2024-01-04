import { NestFactory } from '@nestjs/core';
import * as fs from 'fs'
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as cors from 'cors'
import { config } from 'dotenv';
config();

const SSL = process.env.SSL;
const PORT = process.env.PORT;
const CERT = process.env.SSL_CERT;
const PRIV_KEY = process.env.SSL_PRIV_KEY;
async function bootstrap() {
  let httpsOptions = {}
  // let app : any;
    if (SSL == "true") {
    httpsOptions = {
      key: fs.readFileSync(PRIV_KEY),
      cert: fs.readFileSync(CERT),
    };
  }
  // const app = await NestFactory.create(AppModule);
  const app: INestApplication = SSL == "true" ? await NestFactory.create(AppModule, { httpsOptions }) : await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Master Modules')
    .setDescription('The Default API description')
    .setVersion('1.0')
    .addTag('Default')
    .addBearerAuth({ type: 'http', name: 'token', in: 'header' }, 'authentication')
    .addServer("http://192.168.29.26:3003",'local server')
    .addServer(`http://localhost:3003/`, "localserver1")
    .addServer(`https://master.project.henceforthsolutions.com:3000/`, "liveServer")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.useGlobalPipes(new ValidationPipe());
  app.use(cors());
  await app.listen(process.env.PORT);
  console.log(`Server running at port ${process.env.PORT}....`);
}
bootstrap();
