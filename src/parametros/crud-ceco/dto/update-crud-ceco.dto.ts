import { PartialType } from '@nestjs/mapped-types';
import { Ceco } from './create-crud-ceco.dto';

export class UpdateCrudCecoDto extends PartialType(Ceco) {}
