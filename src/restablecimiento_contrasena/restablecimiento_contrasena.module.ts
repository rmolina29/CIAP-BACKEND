import { Module } from '@nestjs/common';
import { RestablecimientoContrasenaController } from './restablecimiento_contrasena.controller';
import { RestablecimientoContrasenaService } from './restablecimiento_contrasena.service';
import { DatabaseService } from 'src/database/database.service';


@Module({
  controllers: [RestablecimientoContrasenaController],
  providers: [RestablecimientoContrasenaService,DatabaseService]
})
export class RestablecimientoContrasenaModule {}
