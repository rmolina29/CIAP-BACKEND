import { Module } from '@nestjs/common';
import { CrudCecoService } from './crud-ceco.service';

@Module({
  providers: [CrudCecoService],
})
export class CrudCecoModule {}
