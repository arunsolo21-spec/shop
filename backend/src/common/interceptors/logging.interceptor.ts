import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode;
        
        // ✅ ONLY log errors (4xx and 5xx status codes)
        if (statusCode >= 400) {
          const delay = Date.now() - now;
          this.logger.error(`${method} ${url} - ${statusCode} - ${delay}ms`);
        }
        // ✅ Do NOT log successful requests (2xx and 3xx)
      }),
    );
  }
}