import { Module } from '@nestjs/common';
import { CrudClienteService } from './crud-cliente.service';

@Module({
  providers: [CrudClienteService],
})
export class CrudClienteModule {}
