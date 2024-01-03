import { PartialType } from '@nestjs/mapped-types';
import { Cliente } from './create-crud-cliente.dto';

export class UpdateCrudClienteDto extends PartialType(Cliente) {}
