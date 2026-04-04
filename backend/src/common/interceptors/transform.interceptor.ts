import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  data: T;
  message?: string;
  statusCode?: number;
  timestamp?: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode;

        if (data && typeof data === 'object' && 'success' in data) {
          return {
            ...data,
            statusCode,
            timestamp: new Date().toISOString(),
          };
        }

        return {
          success: true,
          data,
          message: 'Request successful',
          statusCode,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}