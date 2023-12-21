import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RestablecimientoContrasenaModule } from './restablecimiento_contrasena/restablecimiento_contrasena.module';
import { DatabaseModule } from './database/database.module';
import { LoginModule } from './auth/login/login.module';
import { EnvioCorreosModule } from './restablecimiento_contrasena/envio_correos/envio_correos.module';
import { CrudUsuarioModule } from './crud_usuario/crud_usuario.module';

@Module({
  imports: [RestablecimientoContrasenaModule, DatabaseModule, LoginModule, EnvioCorreosModule, CrudUsuarioModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
