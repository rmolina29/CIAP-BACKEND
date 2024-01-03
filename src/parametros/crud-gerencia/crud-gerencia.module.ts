import { Module } from '@nestjs/common';
import { CrudGerenciaService } from './crud-gerencia.service';
import { DatabaseService } from 'src/database/database.service';

@Module({
  providers: [CrudGerenciaService,DatabaseService],
})
export class CrudGerenciaModule {}
