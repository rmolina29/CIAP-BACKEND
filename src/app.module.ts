import { Module } from '@nestjs/common';
import { RestablecimientoContrasenaModule } from './restablecimiento_contrasena/restablecimiento_contrasena.module';
import { DatabaseModule } from './database/database.module';
import { LoginModule } from './auth/login/login.module';
import { EnvioCorreosModule } from './envio_correos/envio_correos.module'; 
import { CrudUsuarioModule } from './crud_usuario/crud_usuario.module';
import { ParametrosModule } from './parametros/parametros.module';
import { CrudProyectoModule } from './proyectos/crud-proyecto/crud-proyecto.module';

@Module({
  imports: [
    RestablecimientoContrasenaModule,
    DatabaseModule,
    LoginModule,
    EnvioCorreosModule,
    CrudUsuarioModule,
    ParametrosModule,
    CrudProyectoModule
  ],
})
export class AppModule { }
