import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import Configuration from './configuration';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from './user/user.entity';
import { Profile } from './user/profile.entity';
import { Logs } from './logs/logs.entity';
import { Roles } from './roles/roles.entity';

@Module({
  imports: [
    // 读取配置文件
    ConfigModule.forRoot({
      isGlobal: true,
      load: [Configuration],
    }),
    // 连接数据库: 固定写法
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
    TypeOrmModule.forRootAsync({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [Configuration],
        }),
      ],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        ({
          type: 'mysql',
          host: configService.get('db').host,
          port: configService.get('db').port,
          username: configService.get('db').username,
          password: configService.get('db').password,
          synchronize: true, // 是否应在每次应用程序启动时自动创建数据库架构
          database: configService.get('db').database,
          entities: [User, Profile, Logs, Roles],
          // autoLoadEntities: true
          // logging: ['error'],
          // logger:
        } as TypeOrmModuleOptions),
    }),
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
