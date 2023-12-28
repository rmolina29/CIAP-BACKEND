import { Module } from '@nestjs/common';
import { RolMenuService } from './rol-menu.service';
import { DatabaseService } from 'src/database/database.service';
import { CrudUsuarioService } from '../crud_usuario.service';
import { CrudRolService } from '../crud_rol/crud_rol.service';

@Module({
  providers: [RolMenuService, DatabaseService, CrudUsuarioService,CrudRolService]
})
export class RolMenuModule { }
