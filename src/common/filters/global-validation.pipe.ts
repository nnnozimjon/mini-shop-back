import { ValidationPipe, BadRequestException, ValidationError } from '@nestjs/common';

export class GlobalValidationPipe extends ValidationPipe {
  constructor() {
    super({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const messages = errors.map(err => {
          const constraints = err.constraints ? Object.values(err.constraints) : ['Ошибка валидации'];
          return `Поле "${err.property}" ${constraints[0]}`;
        });

        return new BadRequestException({
          success: false,
          statusCode: 400,
          message: messages,
        });
      },
    });
  }
}
