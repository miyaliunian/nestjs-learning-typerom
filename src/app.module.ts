import { Global, Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import Configuration from './configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogsModule } from './logs/logs.module';
import { RolesModule } from './roles/roles.module';
import ormconfig from '../ormconfig';

@Global() // 这个地方很关键
@Module({
  //imports 一般处理*Module 也是一个装饰器函数，但它用于导入其他模块，以实现模块之间的依赖关系。在 Nest 应用程序中使用模块进行架构设计时，通常会将其分成多个子模块
  imports: [
    // 读取配置文件
    ConfigModule.forRoot({
      isGlobal: true,
      load: [Configuration],
    }),
    // 连接数据库: 固定写法-单环境
    // TypeOrmModule.forRoot({
    //   type: 'mysql',
    //   host: '127.0.0.1',
    //   port: 3306,
    //   username: 'root',
    //   password: '123456',
    //   synchronize: true, // 是否应在每次应用程序启动时自动创建数据库架构
    //   database: 'nest_db',
    //   logging: ['error'],
    // }),
    // 自定义配置: 读取配置
    // TypeOrmModule.forRootAsync({
    //   imports: [
    //     ConfigModule.forRoot({
    //       isGlobal: true,
    //       load: [Configuration],
    //     }),
    //   ],
    //   inject: [ConfigService],
    //   useFactory: (configService: ConfigService) =>
    //     ({
    //       type: 'mysql',
    //       host: configService.get('db').host,
    //       port: configService.get('db').port,
    //       username: configService.get('db').username,
    //       password: configService.get('db').password,
    //       synchronize: true, // 是否应在每次应用程序启动时自动创建数据库架构
    //       database: configService.get('db').database,
    //       entities: [User, Profile, Logs, Roles],
    //       // autoLoadEntities: true
    //       logging: process.env.NODE_ENV === 'development', // 打印所有日志
    //     } as TypeOrmModuleOptions),
    // }),
    TypeOrmModule.forRoot(ormconfig),
    UserModule,
    LogsModule,
    RolesModule,
  ],
  controllers: [],
  providers: [Logger],
  exports: [Logger],
})
export class AppModule {}
