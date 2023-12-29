import { Module } from '@nestjs/common';
import { ParametrosService } from './parametros.service';
import { ParametrosController } from './parametros.controller';
import { CrudGerenciaModule } from './crud-gerencia/crud-gerencia.module';
import { CrudDireccionModule } from './crud-direccion/crud-direccion.module';
import { CrudCecoModule } from './crud-ceco/crud-ceco.module';
import { CrudClienteModule } from './crud-cliente/crud-cliente.module';
import { CrudEstadosModule } from './crud-estados/crud-estados.module';

@Module({
  controllers: [ParametrosController],
  providers: [ParametrosService],
  imports: [CrudGerenciaModule, CrudDireccionModule, CrudCecoModule, CrudClienteModule, CrudEstadosModule],
})
export class ParametrosModule {}
