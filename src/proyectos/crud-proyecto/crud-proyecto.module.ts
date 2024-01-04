import { Module } from '@nestjs/common';
import { CrudProyectoService } from './crud-proyecto.service';
import { CrudProyectoController } from './crud-proyecto.controller';
import { DatabaseService } from 'src/database/database.service';

@Module({
  controllers: [CrudProyectoController],
  providers: [CrudProyectoService,DatabaseService],
})
export class CrudProyectoModule {}
