import AppDataSource from '../ormconfig';
import { User } from '@/user/user.entity';
AppDataSource.initialize()
  .then(async () => {
    console.log('执行代码');
    const resp = await AppDataSource.manager.find(User);
    console.log('resp', resp);
  })
  .catch((err) => {
    console.log(err);
  });
