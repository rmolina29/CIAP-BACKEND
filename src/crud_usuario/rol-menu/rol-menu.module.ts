import { Module } from '@nestjs/common';
import { RolMenuService } from './rol-menu.service';
import { DatabaseService } from 'src/database/database.service';
import { CrudUsuarioService } from '../crud_usuario.service';

@Module({
  providers: [RolMenuService, DatabaseService, CrudUsuarioService]
})
export class RolMenuModule { }
