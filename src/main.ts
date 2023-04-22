import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createLogger } from 'winston';
import * as winston from 'winston';
import { WinstonModule, utilities } from 'nest-winston';
import 'winston-daily-rotate-file';
// import { HttpExceptionFilter } from './filters/http-exception.filter';
import { ALLExceptionFilter } from './filters/all-exception.filter';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { HttpExceptionFilter } from './filters/http-exception.filter';

// 把这部分移动到log.module中
// const instance = createLogger({
//   transports: [
//     new winston.transports.Console({
//       level: 'info',
//       format: winston.format.combine(
//         winston.format.timestamp(),
//         utilities.format.nestLike(),
//       ),
//     }),
//     new winston.transports.DailyRotateFile({
//       level: 'warn',
//       dirname: 'logs',
//       filename: 'application-%DATE%.log',
//       datePattern: 'YYYY-MM-DD-HH',
//       zippedArchive: true,
//       maxSize: '20m',
//       maxFiles: '14d',
//       format: winston.format.combine(
//         winston.format.timestamp(),
//         winston.format.simple(),
//       ),
//     }),
//   ],
// });
async function bootstrap() {
  // 因为日志移动到了 log.module 所以这部分代码也注释掉
  // const logger = WinstonModule.createLogger({ instance });

  const app = await NestFactory.create(AppModule, {
    // logger: logger, // 同样也不用加载日志了
  });
  // 全局filter只有一个
  // app.useGlobalFilters(new HttpExceptionFilter(logger));
  // const httpAdapter = app.get(HttpAdapterHost);
  // app.useGlobalFilters(new ALLExceptionFilter(logger, httpAdapter));
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
