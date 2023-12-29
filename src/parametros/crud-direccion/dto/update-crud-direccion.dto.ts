import { PartialType } from '@nestjs/mapped-types';
import { CreateCrudDireccionDto } from './create-crud-direccion.dto';

export class UpdateCrudDireccionDto extends PartialType(CreateCrudDireccionDto) {}
