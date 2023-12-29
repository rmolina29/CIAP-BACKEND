import { Module } from '@nestjs/common';
import { CrudGerenciaService } from './crud-gerencia.service';

@Module({
  providers: [CrudGerenciaService],
})
export class CrudGerenciaModule {}
