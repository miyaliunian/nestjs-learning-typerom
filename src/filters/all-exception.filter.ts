import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  LoggerService,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import * as requestIP from 'request-ip';

@Catch()
export class ALLExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly logger: LoggerService,
    private readonly httpAdapterHost: HttpAdapterHost,
  ) {}
  catch(exception: any, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = {
      query: request.query,
      params: request.params,
      ip: requestIP.getClientIp(request),
      timestamp: new Date().toISOString(),
    };

    this.logger.error('[Tommy]', responseBody);
    //   使用 reply() 方法将响应发送回客户端，告诉客户端请求的处理结果如何。
    httpAdapter.reply(response, responseBody, httpStatus);
  }
}
