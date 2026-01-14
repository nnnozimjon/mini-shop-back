import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SHOW_SUCCESS_TOAST_KEY } from '@common/decorators';

@Injectable()
export class SuccessToastInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const successMessage = this.reflector.get<string>(SHOW_SUCCESS_TOAST_KEY, context.getHandler());

    return next.handle().pipe(
      map((data) => {
        if (successMessage) {
          return {
            statusCode: 200,
            message: successMessage,
            showSuccessToast: true,
            ...data
          };
        }
        return data;
      })
    );
  }
}
