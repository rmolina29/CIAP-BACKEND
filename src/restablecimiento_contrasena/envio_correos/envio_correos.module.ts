import { Module } from '@nestjs/common';
import { EnvioCorreosService } from './envio_correos.service';

@Module({
  providers: [EnvioCorreosService]
})
export class EnvioCorreosModule {
    
}
