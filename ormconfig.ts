import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Logs } from '@/logs/logs.entity';
import { Roles } from '@/roles/roles.entity';
import { Profile } from '@/user/profile.entity';
import { User } from '@/user/user.entity';

export default {
  type: 'mysql',
  host: '127.0.0.1',
  port: 3306,
  username: 'root',
  password: '123456',
  synchronize: true, // 是否应在每次应用程序启动时自动创建数据库架构
  database: 'nest_db',
  logging: ['error'],
  entities: [User, Profile, Logs, Roles],
} as TypeOrmModuleOptions;
