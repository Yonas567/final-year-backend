import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      let error = 'Request failed';
      let code: string | undefined;
      if (typeof body === 'string') {
        error = body;
      } else if (body && typeof body === 'object') {
        const o = body as Record<string, unknown>;
        if (typeof o.code === 'string') code = o.code;
        const msg = o.message;
        if (typeof msg === 'string') error = msg;
        else if (Array.isArray(msg)) error = msg.join(', ');
        else if (typeof o.error === 'string') error = o.error;
      }
      return res.status(status).json({ ok: false, error, ...(code ? { code } : {}) });
    }

    const message = exception instanceof Error ? exception.message : 'Internal server error';
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      ok: false,
      error: message,
      code: 'INTERNAL_ERROR',
    });
  }
}
