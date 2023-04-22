import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';

@Module({
  imports: [],
  controllers: [RolesController],
  providers: [RolesService],
})
export class RolesModule {}
