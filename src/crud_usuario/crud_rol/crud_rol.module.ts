import { Module } from '@nestjs/common';
import { CrudRolService } from './crud_rol.service';
import { DatabaseService } from 'src/database/database.service';

@Module({
  providers: [CrudRolService,DatabaseService]
})
export class CrudRolModule {}
