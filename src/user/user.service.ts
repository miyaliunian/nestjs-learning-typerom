import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { Logs } from 'src/logs/logs.entity';
import { getUserQueryDTO } from './dto/get-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Logs) private logsRepository: Repository<Logs>,
  ) {}

  findAll(query: getUserQueryDTO): Promise<User[]> {
    const { limit, page, username, gender, role } = query;
    const take = limit || 10;
    const skip = ((page || 1) - 1) * take;
    return this.usersRepository.find({
      select: {
        id: true,
        username: true,
        profile: {
          gender: false,
        },
      },
      relations: {
        profile: true,
        roles: true,
      },
      where: {
        username, // user
        profile: { gender },
        roles: {
          id: role,
        },
      },
      take,
      skip,
    });
  }

  findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
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
      select: {
        id: true, //一定要色孩子为true
        username: true,
      },
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
    const user = await this.findOne(1);
    return this.logsRepository.findOne({
      where: {
        id,
      },
      relations: ['user'],
    });
  }

  findLogsByGroup(id: number) {
    return (
      this.logsRepository
        .createQueryBuilder('logs')
        .select('logs.result, COUNT(logs.result) as count')
        // .addSelect('COUNT("logs.result")', 'count')
        .leftJoinAndSelect('logs.user', 'user') // ORM精髓
        .where('user.id = :id', { id })
        .groupBy('logs.result')
        .getRawMany()
    );
    // return this.usersRepository.query(
    //   'select logs.result, COUNT(logs.result) as rest from logs, user where user.id = logs.user_id and user.id = 1 group by logs.result',
    // );
  }
}
