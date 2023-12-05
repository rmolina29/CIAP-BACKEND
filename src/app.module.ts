import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RestablecimientoContrasenaModule } from './restablecimiento_contrasena/restablecimiento_contrasena.module';
import { DatabaseModule } from './database/database.module';
import { LoginModule } from './auth/login/login.module';

@Module({
  imports: [RestablecimientoContrasenaModule, DatabaseModule, LoginModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
