<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>
## vscode 开始调试

- tsconfig.json

  ```json
  {
    "compilerOptions": {
     ... other options 
      "sourceMap": true, // 一定要设置成true 不然不能打断点
    }
  }
  
  ```

  

- vscode创建调试脚本

  ```javascript
  {
    "version": "0.2.0",
    "configurations": [
      {
        "name": "Launch via NPM",
        "request": "launch",
        "runtimeArgs": ["run-script", "start:debug"], // 加入启动脚本
        "runtimeExecutable": "npm",
        "internalConsoleOptions": "neverOpen",
        "skipFiles": ["<node_internals>/**"],
        "type": "node"
      }
    ]
  }
  
  ```

  

## 文件目录

### 最佳实践

```
src
    core
    common
    middleware
    interceptor
    guards
  user
    interceptors
    user.controller.ts
    user.model.ts
  store
    store.controller.ts
    store.model.ts
```

- 可以使用 monorepo 的方法一一在一个 repo 中创建两个项目，并在他们之间共享共同的东西 -没有模块目录，按照功能进行划分 -把通用/核心的东西归纳为单一的目录: common， 比如：拦截器/守卫/管道

[CRUD 文档地址](https://docs.nestjs.com/recipes/crud-generator)

nest g module 模块名
nest g co controller 名字

如何配置 HRM

[HMR](https://docs.nestjs.com/recipes/hot-reload)

安装依赖：

```bash
pnpm i --save-dev webpack-node-externals run-script-webpack-plugin webpack
```

工程根目录增加 webpack-hmr.config.js

```javascript
const nodeExternals = require('webpack-node-externals');
const { RunScriptWebpackPlugin } = require('run-script-webpack-plugin');

module.exports = function (options, webpack) {
  return {
    ...options,
    entry: ['webpack/hot/poll?100', options.entry],
    externals: [
      nodeExternals({
        allowlist: ['webpack/hot/poll?100'],
      }),
    ],
    plugins: [
      ...options.plugins,
      new webpack.HotModuleReplacementPlugin(),
      new webpack.WatchIgnorePlugin({
        paths: [/\.js$/, /\.d\.ts$/],
      }),
      new RunScriptWebpackPlugin({
        name: options.output.filename,
        autoRestart: false,
      }),
    ],
  };
};
```

main.ts 文件增加如下配置

```javascript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('/api');
  await app.listen(3000);

  // 开启HMR
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
```

此时没有 webapck-env 变量还需要安装 依赖

```bash
pnpm i -D @types/webpack-env
```

修改启动脚本

```bash
"start:debug": "nest build --webpack --webpackPath webpack-hmr.config.js --watch",
```

# TS

## 函数类型

TS 定义 普通函数

```javascript
function add(arg1: number, arg2: number): number {
  return arg1 + arg2;
}
```

TS 箭头函数 类型

```javascript
const add = (arg1: number, arg2: number): number => {
  return arg1 + arg2;
};
```

匿名函数：稍微复杂点的例子

```javascript
cosnt add2: (arg1:number, arg2:number) => number = (arg1:number, arg2: number) => arg1+arg2
```

(arg1:number, arg2:number) => number : 相当于函数的类型声明

= (arg1:number, arg2: number) => arg1+arg2：才是函数体

## 函数重载

TS 函数重载不能用箭头函数声明!!!

```javascript
//函数重载声明
function handleData(x:string): string[]
function handleData(x:number): string

//函数体
function handleData(x:any): any {
 if(typeof x === 'string'){
   return x.split("")
 } else {
   return x.toString().split("").join(",")
 }
}
```

```javascript
handleData('abc').join('_');
// handleData("123").join("_") error 提示string上个未有join方法

handleData(false); // 参数传false也是报错的 提示boolean不能赋值给number或string 虽然满足了入参any类型，但是我们定义得函数重载入参 限制了入参类型只能是string | number,
```

## interface 定义函数

```javascript
interface Func {
  (num1: number, number2: number): number;
}
const addFunc: Func = (arg1, arg2) => arg1 + arg2;
```

interface 如何绕开多余属性检查

```javascript
interface MyType {
  color: string
}

const getTypes = (myType: MyType)=>{
  return `${myType.color}`
}

如果传入多余的属性 此时ts是报错的
getTypes({
  color: 'red',
  type: 'color', // 报错了
})

如何解决呢
getTypes({
  color: 'red',
  type: 'color', // 此时不报错
} as MyType)
```

## 设置环境变量

### 全局

 nestJS 设置环境变量 是通过 doNet 这个包实现的

app.module.ts

```javascript
import { ConfigModule } from '@nestjs/config'; // 导入依赖包

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 设置成全局的 这样设置以后就可以在任何module内访问
    }),
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

需要取.env 的 module

```javascript
import { Controller, Get, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { ConfigService } from '@nestjs/config';

@Controller('user')
export class UserController {
  // 应该在controller中调用service
  constructor(
    private userService: UserService,
    private configService: ConfigService, //依赖注入
  ) {
    // this.userService = userService;
  }
  @Get('/')
  get(): any {
    const DB = this.configService.get('DATABASE_USER'); //  ConfigService 提供了一个get方法获取.env中内容
    console.log(DB);
    return this.userService.getUsers();
  }

  @Post('/addUser')
  addUser() {
    return this.userService.addUser();
  }
}

```

### 模块内访问

模块内导入

```javascript
import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()], // 模块内导入
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
```

模块的 controler 访问

```javascript
import { Controller, Get, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { ConfigService } from '@nestjs/config';

@Controller('user')
export class UserController {
  // 应该在controller中调用service
  constructor(
    private userService: UserService,
    private configService: ConfigService, //DI
  ) {
    // this.userService = userService;
  }
  @Get('/')
  get(): any {
    const DB = this.configService.get('DATABASE_USER');
    console.log(DB);
    return this.userService.getUsers();
  }

  @Post('/addUser')
  addUser() {
    return this.userService.addUser();
  }
}

```

.env 如何与 TS 结合

```javascript
// ts类型声明文件
export enum ConfigEnum {
  DATABASE_USER = 'test',
  DATABASE_PASSWORD = 'test',
}

.env 文件
DATABASE_USER=test
DATABASE_PASSWORD=test
```

## 进阶方式

- /config/config.yml

```javascript
db:
  mysql:
    host: 127.0.0.1
    name: mysql-dev
    port: 3306

  mysql2:
    host: 127.0.0.1
    name: mysql-dev2
    port: 3306
```

- /src/configuration.ts

```javascript
import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';
const YAML_CONFIG_FILENAME = 'config.yml';

const filePath = join(__dirname, '../config', YAML_CONFIG_FILENAME);

//  因为 ConfigModule有一个load方法， 这个方法需要一个函数
export default () => {
  return yaml.load(readFileSync(filePath, 'utf8'));
};
```

- controller 中使用

```javascript
import { Controller, Get, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { ConfigService } from '@nestjs/config';

@Controller('user')
export class UserController {
  // 应该在controller中调用service
  constructor(
    private userService: UserService,
    private configService: ConfigService, // DI
  ) {
    // this.userService = userService;
  }
  @Get('/')
  get(): any {
    const DB = this.configService.get('db'); // 还是 ConfigService 读取
    console.log(DB);
    return this.userService.getUsers();
  }

  @Post('/addUser')
  addUser() {
    return this.userService.addUser();
  }
}

```

## ORM

- 方便维护：数据模型定义在同一个地方 利于重构
- 代码量少、对接多种库：代码逻辑更易懂
- 工具多、自动化能力强：数据库删除关联数据、事务操作等

## 已经存在的数据库 反向生成 entity

typeorm-model-generator

## NestJS 第三方日志模块



pino 

优点 只需引入 不用配置

```bash
pnpm i  nestjs-pino   pino-pretty  
```



app.module.ts 注册

```typescript
import { LoggerModule, Logger } from 'nestjs-pino';
@Module({
  
  imports: [
      LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
          },
        },
      },
    }),
    ...other imports
  ]
})
```

在需要使用的地方 使用

```typescript
import { Logger } from 'nestjs-pino';

  constructor(
    private userService: UserService,
    private configService: ConfigService,
    private logger: Logger,
  ) {
    this.logger.log('-- UserController init --');
  }


```

![image-20230417154341024](/Users/doudoufei/Library/Application Support/typora-user-images/image-20230417154341024.png)

##  find* 查询

```javascript
   this.logsRepository
        .createQueryBuilder('logs')、
        .select('logs.result, COUNT(logs.result) as count')
        // .addSelect('COUNT("logs.result")', 'count')
        .leftJoinAndSelect('logs.user', 'user') // ORM精髓
        .where('user.id = :id', { id })
        .groupBy('logs.result')
        .getRawMany()
```

# Query Builder

```javascript
this.usersRepository.query(
      'select logs.result, COUNT(logs.result) as rest from logs, user where user.id = logs.user_id and user.id = 1 group by logs.result',
    );
```

## 

## 日志系统

安装依赖

```bash
pnpm i nest-winston winston
```



安装依赖  处理滚动日志

```bash
pnpm i winston-daily-rotate-file

```



### 设置日志级别



## 全局异常过滤

###  

### 自定义异常Filter

- 前置

```javascript
switchToHttp()是一个Nest.js框架提供的方法，用于获取到HTTP请求和响应对象。在Nest.js中，每个请求都会创建一个上下文对象，其中包含了当前请求和响应对象。通过switchToHttp()方法可以将当前的执行上下文切换到HTTP上下文中，从而获取到当前的请求和响应对象。

具体地说，在控制器、拦截器或管道等Nest.js的中间件中，我们可以使用switchToHttp()方法来访问当前请求和响应对象。例如，在控制器方法中，可以使用以下代码来获取请求和响应对象：

@Get()
async findAll(@Req() request, @Res() response) {
  const httpContext = context.switchToHttp();
  const httpRequest = httpContext.getRequest();
  const httpResponse = httpContext.getResponse();

  // access to the request and response objects
}
这段代码中，我们首先使用@Req()和@Res()装饰器来获取到请求和响应对象，并随后使用switchToHttp()方法获取到HTTP上下文对象。通过调用getRequest()和getResponse()方法，就可以获得当前的请求和响应对象了。
```



- http-exception.filter.ts

```typescript
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  LoggerService,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException) // 只处理HttpException而不处理其它的
export class HttpExceptionFilter implements ExceptionFilter {
  // 接入日志 这就是依赖注入的好处
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
    // throw new Error('Method not implemented.');
  }
}


```

```javascript
这是一个Node.js中Express框架中常用的方法，用于在HTTP响应中同时设置状态码和JSON数据。

其中，response是一个代表HTTP响应的对象，status是要设置的HTTP状态码，json()方法用于将要作为响应主体发送的JavaScript对象转换为JSON字符串并设置响应头Content-Type为application/json。

这个方法可以传递任何JavaScript对象，包括数组和嵌套对象，它们会被自动序列化为JSON格式。

示例：

app.get('/users', (req, res) => {
  const users = [{ name: 'Alice', age: 30 }, { name: 'Bob', age: 40 }];
  res.status(200).json(users);
});
上面的代码定义了一个路由，当客户端使用GET请求/users时，它将返回一个状态码为200并附带用户列表的JSON响应。
```



- 自定义Filter前置

```javascript
HttpAdapterHost 是 NestJS 中的一个类，它提供了一个访问 HTTP 适配器（HttpAdapter）的接口。HTTP 适配器是负责处理传入的 HTTP 请求和出站响应的组件。

使用 HttpAdapterHost 可以方便地获取当前应用程序中正在使用的 HTTP 适配器，并在需要时执行与其相关的操作。例如，您可以使用 HttpAdapterHost 来访问当前应用程序的 request 和 response 对象，或者用于注册全局拦截器等。

以下是一个示例，在控制器中使用 HttpAdapterHost 获取请求对象并记录请求路径：

typescript
import { Controller, Get } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Controller()
export class AppController {
  constructor(private httpAdapterHost: HttpAdapterHost) {}

  @Get()
  root() {
    const { request } = this.httpAdapterHost.httpAdapter;
    console.log(`Request path: ${request.url}`);
    return 'Hello World!';
  }
}
在上面的示例中，我们注入了 HttpAdapterHost 并在 root() 方法中使用它来获取当前请求对象。然后，我们记录请求的 URL 并返回简单的 "Hello World!" 响应。

请注意，这只是 HttpAdapterHost 类的一种用法。具体使用方式取决于您的应用程序需求和设计。




2023/4/21 10:24:22

switchToHttp()也能获取request response  


2023/4/21 10:24:44

switchToHttp()是一个Nest.js框架提供的方法，用于获取到HTTP请求和响应对象。在Nest.js中，每个请求都会创建一个上下文对象，其中包含了当前请求和响应对象。通过switchToHttp()方法可以将当前的执行上下文切换到HTTP上下文中，从而获取到当前的请求和响应对象。

具体地说，在控制器、拦截器或管道等Nest.js的中间件中，我们可以使用switchToHttp()方法来访问当前请求和响应对象。例如，在控制器方法中，可以使用以下代码来获取请求和响应对象：

@Get()
async findAll(@Req() request, @Res() response) {
  const httpContext = context.switchToHttp();
  const httpRequest = httpContext.getRequest();
  const httpResponse = httpContext.getResponse();

  // access to the request and response objects
}
这段代码中，我们首先使用@Req()和@Res()装饰器来获取到请求和响应对象，并随后使用switchToHttp()方法获取到HTTP上下文对象。通过调用getRequest()和getResponse()方法，就可以获得当前的请求和响应对象了。




2023/4/21 10:24:51

httpAdapter.reply(response, responseBody, httpStatus);


2023/4/21 10:25:02

这个代码片段出现在一个网络服务中，其中httpAdapter是一个处理HTTP请求和响应的类或模块。该方法reply()用于将指定的响应(response)、响应体(responseBody)和HTTP状态码(httpStatus)发送回客户端。

具体来说，当客户端发起一个 HTTP 请求时，服务器会使用 httpAdapter 处理该请求，并生成一个包含响应体和 HTTP 状态码的响应对象。接着，使用 reply() 方法将响应发送回客户端，告诉客户端请求的处理结果如何。
```



- 自定义Filter

```javascript
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

```





### 设置成全局Filter(全局过滤器有且只有一个)

- main.ts

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createLogger } from 'winston';
import * as winston from 'winston';
import { WinstonModule, utilities } from 'nest-winston';
import 'winston-daily-rotate-file';
import { HttpExceptionFilter } from './filters/http-exception.filter';

async function bootstrap() {
  const instance = createLogger({
    transports: [
      new winston.transports.Console({
        level: 'info',
        format: winston.format.combine(
          winston.format.timestamp(),
          utilities.format.nestLike(),
          // winston.format.simple(),
        ),
      }),

      new winston.transports.DailyRotateFile({
        level: 'warn',
        dirname: 'logs',
        filename: 'application-%DATE%.log',
        datePattern: 'YYYY-MM-DD-HH',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.simple(),
        ),
      }),
    ],
  });

  const logger = WinstonModule.createLogger({ instance });// logger的类型是 LoggerService

  const app = await NestFactory.create(AppModule, {
    logger: logger,
  });
  // 全局filte只有一个
  app.useGlobalFilters(new HttpExceptionFilter(logger)); // 设置全局Filgerbing并计入日志
  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();


```



## 数据库迁移

