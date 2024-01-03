import { PartialType } from '@nestjs/mapped-types';
import { DireccionDto } from './create-crud-direccion.dto';

export class UpdateCrudDireccionDto extends PartialType(DireccionDto) { }
