import { Injectable } from '@nestjs/common';
import { CreateCrudClienteDto } from './dto/create-crud-cliente.dto';
import { UpdateCrudClienteDto } from './dto/update-crud-cliente.dto';

@Injectable()
export class CrudClienteService {
  create(createCrudClienteDto: CreateCrudClienteDto) {
    return 'This action adds a new crudCliente';
  }

  findAll() {
    return `This action returns all crudCliente`;
  }

  findOne(id: number) {
    return `This action returns a #${id} crudCliente`;
  }

  update(id: number, updateCrudClienteDto: UpdateCrudClienteDto) {
    return `This action updates a #${id} crudCliente`;
  }

  remove(id: number) {
    return `This action removes a #${id} crudCliente`;
  }
}
