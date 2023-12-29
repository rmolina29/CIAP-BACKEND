import { PartialType } from '@nestjs/mapped-types';
import { CreateCrudEstadoDto } from './create-crud-estado.dto';

export class UpdateCrudEstadoDto extends PartialType(CreateCrudEstadoDto) {}
