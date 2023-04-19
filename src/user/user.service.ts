import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { Logs } from 'src/logs/logs.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Logs) private logsRepository: Repository<Logs>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async create(user: User) {
    const userTemp = await this.usersRepository.save(user);
    return this.usersRepository.save(userTemp);
  }

  update(id: number, user: Partial<User>) {
    return this.usersRepository.update(id, user);
  }

  remove(id: number) {
    return this.usersRepository.delete(id);
  }

  findProfile(id: number) {
    // 如果查询报错 一定要检查一下 user.entity中的 oneToMany 是否设置了第二个属性
    return this.usersRepository.findOne({
      where: {
        id,
      },
      relations: ['profile'],
    });
  }

  findLogs(id: number) {
    return this.usersRepository.findOne({
      where: {
        id,
      },
      relations: ['logs'],
    });
  }

  async findUserLogs(id: number) {
    const user = await this.findOne('前端逗逗飞');
    console.log(user);
    return this.logsRepository.findOne({
      where: {
        id,
      },
      relations: ['user'],
    });
  }
}
