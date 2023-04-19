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
