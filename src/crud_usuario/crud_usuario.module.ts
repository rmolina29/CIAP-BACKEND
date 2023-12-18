import { Module } from '@nestjs/common';
import { CrudUsuarioController } from './crud_usuario.controller';
import { CrudUsuarioService } from './crud_usuario.service';
import { CrudRolModule } from './crud_rol/crud_rol.module';
import { DatabaseService } from 'src/database/database.service';
import { CrudRolService } from './crud_rol/crud_rol.service';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  controllers: [CrudUsuarioController],
  providers: [CrudUsuarioService,DatabaseService,CrudRolService],
  imports: [CrudRolModule]
})
export class CrudUsuarioModule {}