import { Module } from '@nestjs/common';
import { RestablecimientoContrasenaController } from './restablecimiento_contrasena.controller';
import { RestablecimientoContrasenaService } from './restablecimiento_contrasena.service';
import { DatabaseService } from 'src/database/database.service';
import { EnvioCorreosService } from './envio_correos/envio_correos.service';

@Module({
  controllers: [RestablecimientoContrasenaController],
  providers: [RestablecimientoContrasenaService,DatabaseService,EnvioCorreosService]
})
export class RestablecimientoContrasenaModule {}
