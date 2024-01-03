import { Module } from '@nestjs/common';
import { CrudCecoService } from './crud-ceco.service';
import { DatabaseService } from 'src/database/database.service';

@Module({
  providers: [CrudCecoService,DatabaseService],
})
export class CrudCecoModule {}
