import { Module } from '@nestjs/common';
import { ParametrosService } from './parametros.service';
import { ParametrosController } from './parametros.controller';

@Module({
  controllers: [ParametrosController],
  providers: [ParametrosService],
})
export class ParametrosModule {}
