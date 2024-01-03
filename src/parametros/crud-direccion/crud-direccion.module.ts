import { Module } from '@nestjs/common';
import { CrudDireccionService } from './crud-direccion.service';
import { DatabaseService } from 'src/database/database.service';

@Module({
  providers: [CrudDireccionService,DatabaseService],
})
export class CrudDireccionModule {}
