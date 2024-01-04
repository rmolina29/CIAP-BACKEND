import { Module } from '@nestjs/common';
import { CrudProyectoService } from './crud-proyecto.service';
import { CrudProyectoController } from './crud-proyecto.controller';

@Module({
  controllers: [CrudProyectoController],
  providers: [CrudProyectoService],
})
export class CrudProyectoModule {}
