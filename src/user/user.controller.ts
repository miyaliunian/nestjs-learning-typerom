import { Controller, Get, Inject, LoggerService, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from './user.service';
import { User } from './user.entity';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Controller('user')
export class UserController {
  constructor(
    // private configService: ConfigService, // 设置配置文件后 就不要需要
    private userService: UserService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {
    this.logger.log('User Controller init');
  }

  @Get('/:id')
  getUsers() {
    return this.userService.findAll();
  }

  @Post()
  addUser() {
    const user = { username: '测试插入', password: '133455' } as User;
    return this.userService.create(user);
  }

  @Get('/profile')
  getUserProfile(): any {
    return this.userService.findProfile(1);
  }

  @Get('/logs')
  getUserLogs(): any {
    return this.userService.findUserLogs(1);
  }

  @Get('/logsByGroup')
  getLogsByGroup() {
    this.logger.log('logsByGroup请求成功');
    return this.userService.findLogsByGroup(1);
  }
}
