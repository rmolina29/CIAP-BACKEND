import { Module } from '@nestjs/common';
import { CrudEstadosService } from './crud-estados.service';

@Module({
  providers: [CrudEstadosService],
})
export class CrudEstadosModule { }
