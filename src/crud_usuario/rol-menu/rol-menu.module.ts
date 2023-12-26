import { Module } from '@nestjs/common';
import { RolMenuService } from './rol-menu.service';
import { DatabaseService } from 'src/database/database.service';

@Module({
  providers: [RolMenuService,DatabaseService]
})
export class RolMenuModule {}
