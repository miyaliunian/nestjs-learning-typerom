import { Logs } from 'src/logs/logs.entity';
import { Roles } from 'src/roles/roles.entity';
import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Profile } from './profile.entity';
import { profile } from 'console';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  username: string;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  password: string;

  @OneToMany(() => Logs, (logs) => logs.user)
  logs: Logs[];

  @ManyToMany(() => Roles, (roles) => roles.users)
  roles: Roles[];

  // 参数二是设置一对一关系中的反向关系
  /**
   *，如果 @OneToOne 装饰器中没有指定 Profile 实体的反向关系，则在查询 User 实体时无法自动加载其关联的 Profile 实体。此外，在查询结果中将缺少 Profile 实体的属性，因为它们未被显式选择或加载。
   profile.user 表示 Profile 实体中的 user 属性引用了 User 实体
   */
  @OneToOne(() => Profile, (profile) => profile.user)
  profile: Profile;
}
