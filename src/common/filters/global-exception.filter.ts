import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';
import { ErrorCode } from '@common/enums';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = ErrorCode.UNKNOWN_ERROR;
    let message = 'Внутренняя ошибка сервера';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object') {
        const r = res as any;
        message = r.message || message;
        code = r.code || code;
      }
    } else if (
      typeof exception === 'object' &&
      exception &&
      (exception as any).response?.message
    ) {
      status = HttpStatus.BAD_REQUEST;
      code = ErrorCode.VALIDATION_ERROR;
      message = (exception as any).response.message;
    } else if (exception instanceof QueryFailedError) {
      status = HttpStatus.BAD_REQUEST;
      code = ErrorCode.DATABASE_ERROR;
      message = 'Ошибка базы данных';
    } else if (
      exception instanceof Error &&
      exception.name === 'JsonWebTokenError'
    ) {
      status = HttpStatus.UNAUTHORIZED;
      code = ErrorCode.TOKEN_INVALID;
      message = 'Неверный токен';
    } else if (
      exception instanceof Error &&
      exception.name === 'TokenExpiredError'
    ) {
      status = HttpStatus.UNAUTHORIZED;
      code = ErrorCode.TOKEN_EXPIRED;
      message = 'Токен истёк';
    }

    console.log({
      success: false,
      statusCode: status,
      code,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
    });
  }
}
