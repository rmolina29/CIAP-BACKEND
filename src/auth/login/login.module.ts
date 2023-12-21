import { Module } from '@nestjs/common';
import { LoginController } from './login.controller';
import { LoginService } from './login.service';
import { DatabaseService } from 'src/database/database.service'; 
import { EnvioCorreosService } from 'src/restablecimiento_contrasena/envio_correos/envio_correos.service';

@Module({
  controllers: [LoginController],
  providers: [LoginService,DatabaseService,EnvioCorreosService]
})
export class LoginModule {}
