import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Logs } from '@/logs/logs.entity';
import { Roles } from '@/roles/roles.entity';
import { Profile } from '@/user/profile.entity';
import { User } from '@/user/user.entity';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as fs from 'fs';
import * as dotEnv from 'dotenv';
import { get } from 'http';

// 通过环境变量读取不同的.env文件
function getEnv(env: string): Record<string, unknown> {
  if (fs.existsSync(env)) {
    return dotEnv.parse(fs.readFileSync(env));
  }
  return {};
}
// 通过dotNev来解析不同的配置文件

function buildConnectionOption() {
  const defaultConfig = getEnv('.env');
  const envConfig = getEnv(`.env.${process.env.NODE_ENV}`);
  const config = { ...defaultConfig, envConfig };
  console.log(config);
  return {
    type: 'mysql',
    host: '127.0.0.1',
    port: 3306,
    username: 'root',
    password: '123456',
    synchronize: true, // 是否应在每次应用程序启动时自动创建数据库架构
    database: 'nest_db',
    // logging: ['error'],
    logging: true,
    entities: [User, Profile, Logs, Roles],
  } as TypeOrmModuleOptions;
}

export const connectionParams = buildConnectionOption();

export default new DataSource({
  ...connectionParams,
  migrations: ['src/migrations/**'],
  subscribers: [],
} as DataSourceOptions);
