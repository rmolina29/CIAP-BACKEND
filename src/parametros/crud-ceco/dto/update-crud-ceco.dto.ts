import { PartialType } from '@nestjs/mapped-types';
import { CreateCrudCecoDto } from './create-crud-ceco.dto';

export class UpdateCrudCecoDto extends PartialType(CreateCrudCecoDto) {}
