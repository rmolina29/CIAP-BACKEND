import { Module } from '@nestjs/common';
import { CrudUsuarioController } from './crud_usuario.controller';
import { CrudUsuarioService } from './crud_usuario.service';
import { CrudRolModule } from './crud_rol/crud_rol.module';
import { DatabaseService } from 'src/database/database.service';
import { CrudRolService } from './crud_rol/crud_rol.service';
import { EnvioCorreosService } from 'src/envio_correos/envio_correos.service';
import { ValidacionService } from './validaciones_crudUsuario/validaciones_usuario_crud.service';
import { RolMenuModule } from './rol-menu/rol-menu.module';
import { RolMenuService } from './rol-menu/rol-menu.service';

@Module({
  controllers: [CrudUsuarioController],
  providers: [CrudUsuarioService,DatabaseService,CrudRolService,EnvioCorreosService,ValidacionService,RolMenuService],
  imports: [CrudRolModule, RolMenuModule]
})
export class CrudUsuarioModule {}
