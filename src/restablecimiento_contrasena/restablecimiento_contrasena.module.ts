import { Module } from '@nestjs/common';
import { RestablecimientoContrasenaController } from './restablecimiento_contrasena.controller';
import { RestablecimientoContrasenaService } from './restablecimiento_contrasena.service';

@Module({
  controllers: [RestablecimientoContrasenaController],
  providers: [RestablecimientoContrasenaService]
})
export class RestablecimientoContrasenaModule {}
