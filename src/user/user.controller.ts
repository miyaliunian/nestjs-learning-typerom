import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  LoggerService,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from './user.service';
import { User } from './user.entity';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { getUserQueryDTO } from './dto/get-user.dto';

@Controller('user')
export class UserController {
  constructor(
    private configService: ConfigService, // 设置配置文件后 就不要需要
    private userService: UserService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {
    this.logger.log('User Controller init');
  }

  @Get()
  getUsers(@Query() query: getUserQueryDTO) {
    return this.userService.findAll(query);
  }

  @Get('/:id')
  getUser(@Param() params: { id: number }) {
    const { id } = params;
    return this.userService.findOne(id);
  }

  @Post()
  addUser(@Body() userDTO: User, @Req() req) {
    return this.userService.create(userDTO);
  }

  @Delete('/:id')
  deleteUser(@Param('id') id: number) {
    return this.userService.remove(id);
  }

  @Get('/profile/:id')
  getUserProfile(@Param() params: { id: number }): any {
    const { id } = params;
    return this.userService.findProfile(id);
  }

  @Patch('/:id')
  updateUser(@Body() dto: any, @Param('id') id: number) {
    return this.userService.update(id, dto as User);
  }

  // todo
  // logs module
  @Get('/logs')
  getUserLogs(@Param() Param): any {
    return this.userService.findUserLogs(1);
  }

  @Get('/logsByGroup')
  getLogsByGroup() {
    return this.userService.findLogsByGroup(1);
  }
}
