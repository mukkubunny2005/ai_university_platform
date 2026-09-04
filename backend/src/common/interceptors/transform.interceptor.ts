import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((res) => {
        // If response already has custom message and data properties
        if (res && typeof res === 'object' && 'data' in res && 'message' in res && !Array.isArray(res)) {
          return {
            success: true,
            message: res.message || 'Operation successful',
            data: res.data,
          };
        }

        return {
          success: true,
          message: 'Operation completed successfully',
          data: res !== undefined ? res : null,
        };
      }),
    );
  }
}
