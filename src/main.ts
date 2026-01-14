import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  GlobalExceptionFilter,
  GlobalValidationPipe,
  SuccessToastInterceptor,
} from '@common/filters';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'debug', 'verbose'],
  });
  app.setGlobalPrefix('mini-shop/api/v1');

  app.enableCors({
    origin: ['http://localhost:5173'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  
  app.useGlobalInterceptors(new SuccessToastInterceptor(app.get(Reflector)));
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalPipes(new GlobalValidationPipe());
  await app.listen(3000);
}
bootstrap();
