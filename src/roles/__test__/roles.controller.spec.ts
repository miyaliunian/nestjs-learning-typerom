/*
 * @Author: 米亚流年 354849262@qq.com
 * @Date: 2023-04-21 11:13:55
 * @LastEditors: 米亚流年 354849262@qq.com
 * @LastEditTime: 2023-04-21 11:14:11
 * @FilePath: /nest-end/src/roles/__test__/roles.controller.spec.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from '../roles.controller';

describe('RolesController', () => {
  let controller: RolesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
    }).compile();

    controller = module.get<RolesController>(RolesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
