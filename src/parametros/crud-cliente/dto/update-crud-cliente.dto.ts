import { PartialType } from '@nestjs/mapped-types';
import { CreateCrudClienteDto } from './create-crud-cliente.dto';

export class UpdateCrudClienteDto extends PartialType(CreateCrudClienteDto) {}
