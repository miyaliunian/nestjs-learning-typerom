import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  LoggerService,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException) // 只处理HttpException而不是其它的
export class HttpExceptionFilter implements ExceptionFilter {
  // 接入日志
  constructor(private logger: LoggerService) {}
  // exception 正在处理的异常对象
  // ArgumentsHost 是一个功能强大的实用程序对象，
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    this.logger.error(exception.message, exception.stack);
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.path,
      message: exception.message || HttpException.name,
      exceptionName: HttpException.name,
    });
  }
}
