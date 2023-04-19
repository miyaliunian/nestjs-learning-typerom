import { Controller, Get, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from './user.service';
import { ConfigEnum } from 'src/enum/config.enum';
import { User } from './user.entity';

@Controller('user')
export class UserController {
  constructor(
    private configService: ConfigService, // 设置配置文件后 就不要需要
    private userService: UserService,
  ) {}

  @Get()
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
}
