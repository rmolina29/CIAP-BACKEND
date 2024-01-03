import { Module } from '@nestjs/common';
import { CrudClienteService } from './crud-cliente.service';
import { DatabaseService } from 'src/database/database.service';

@Module({
  providers: [CrudClienteService,DatabaseService],
})
export class CrudClienteModule {}
