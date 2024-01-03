import { PartialType } from '@nestjs/mapped-types';
import { EstadosDto } from './create-crud-estado.dto';

export class UpdateCrudEstadoDto extends PartialType(EstadosDto) {}
