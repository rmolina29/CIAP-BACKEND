import { Module } from '@nestjs/common';
import { RestablecimientoContrasenaModule } from './restablecimiento_contrasena/restablecimiento_contrasena.module';
import { DatabaseModule } from './database/database.module';
import { LoginModule } from './auth/login/login.module';
import { EnvioCorreosModule } from './restablecimiento_contrasena/envio_correos/envio_correos.module';
import { CrudUsuarioModule } from './crud_usuario/crud_usuario.module';
import { ParametrosModule } from './parametros/parametros.module';

@Module({
  imports: [RestablecimientoContrasenaModule, DatabaseModule, LoginModule, EnvioCorreosModule, CrudUsuarioModule, ParametrosModule],
})
export class AppModule {}
