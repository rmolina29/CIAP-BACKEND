import { Module } from '@nestjs/common';
import { CrudDireccionService } from './crud-direccion.service';

@Module({
  providers: [CrudDireccionService],
})
export class CrudDireccionModule {}
