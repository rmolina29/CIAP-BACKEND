import { Module } from '@nestjs/common';
import { CrudEstadosService } from './crud-estados.service';
import { DatabaseService } from 'src/database/database.service';

@Module({
  providers: [CrudEstadosService,DatabaseService],
})
export class CrudEstadosModule { }
