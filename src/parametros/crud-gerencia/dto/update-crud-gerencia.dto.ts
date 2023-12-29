import { PartialType } from '@nestjs/mapped-types';
import { CreateCrudGerenciaDto } from './create-crud-gerencia.dto';

export class UpdateCrudGerenciaDto extends PartialType(CreateCrudGerenciaDto) {}
