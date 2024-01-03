import { PartialType } from '@nestjs/mapped-types';
import { Gerencia } from './create-crud-gerencia.dto';

export class UpdateCrudGerenciaDto extends PartialType(Gerencia) {}
