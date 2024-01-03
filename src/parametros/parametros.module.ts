import { Module } from '@nestjs/common';
import { ParametrosService } from './parametros.service';
import { ParametrosController } from './parametros.controller';
import { CrudGerenciaModule } from './crud-gerencia/crud-gerencia.module';
import { CrudDireccionModule } from './crud-direccion/crud-direccion.module';
import { CrudCecoModule } from './crud-ceco/crud-ceco.module';
import { CrudClienteModule } from './crud-cliente/crud-cliente.module';
import { CrudEstadosModule } from './crud-estados/crud-estados.module';
import { CrudClienteService } from './crud-cliente/crud-cliente.service';
import { CrudCecoService } from './crud-ceco/crud-ceco.service';
import { CrudGerenciaService } from './crud-gerencia/crud-gerencia.service';
import { CrudEstadosService } from './crud-estados/crud-estados.service';
import { CrudDireccionService } from './crud-direccion/crud-direccion.service';
import { DatabaseService } from 'src/database/database.service';
import { GerenciaContoller } from './crud-gerencia/gerencia.controller';
import { DireccionController } from './crud-direccion/direccion.contoller';
import { CecoController } from './crud-ceco/ceco.controller';
import { ClienteController } from './crud-cliente/cliente.controller';
import { EstadosController } from './crud-estados/estados.controller';

@Module({
  controllers: [ParametrosController, GerenciaContoller, DireccionController, CecoController, ClienteController, EstadosController],
  providers: [ParametrosService, CrudClienteService, CrudCecoService, CrudGerenciaService, CrudEstadosService, CrudDireccionService, DatabaseService],
  imports: [CrudGerenciaModule, CrudDireccionModule, CrudCecoModule, CrudClienteModule, CrudEstadosModule],
})
export class ParametrosModule { }
