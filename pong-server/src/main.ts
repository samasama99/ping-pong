import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WsAdapter } from '@nestjs/platform-ws';
import * as cors from 'cors';
import { NestExpressApplication } from '@nestjs/platform-express';
import SocketAdapter from './socket.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // const app = await NestFactory.create<NestExpressApplication>(AppModule, {
  //   cors: {
  //     origin: '*',
  //     credentials: true,
  //   }
  // });


  // app.useWebSocketAdapter(new WsAdapter(app));
  // // app.useWebSocketAdapter(new SocketAdapter(app));

  // app.use(cors());

  await app.listen(3000);
}
bootstrap();
