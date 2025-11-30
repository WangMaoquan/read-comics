import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
  code: number;
  message: string;
  success: boolean;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        // 如果返回的数据已经包含了标准格式（例如分页数据），则合并
        if (
          data &&
          typeof data === 'object' &&
          'data' in data &&
          'total' in data
        ) {
          return {
            code: 200,
            message: 'success',
            success: true,
            ...data, // 展开分页结构: { data: [], total: 10, page: 1 ... }
          };
        }

        return {
          data,
          code: 200,
          message: 'success',
          success: true,
        };
      }),
    );
  }
}
