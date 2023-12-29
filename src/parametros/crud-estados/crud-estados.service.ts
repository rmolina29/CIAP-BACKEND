import { Injectable } from '@nestjs/common';
import { CreateCrudEstadoDto } from './dto/create-crud-estado.dto';
import { UpdateCrudEstadoDto } from './dto/update-crud-estado.dto';

@Injectable()
export class CrudEstadosService {
  create(createCrudEstadoDto: CreateCrudEstadoDto) {
    return 'This action adds a new crudEstado';
  }

  findAll() {
    return `This action returns all crudEstados`;
  }

  findOne(id: number) {
    return `This action returns a #${id} crudEstado`;
  }

  update(id: number, updateCrudEstadoDto: UpdateCrudEstadoDto) {
    return `This action updates a #${id} crudEstado`;
  }

  remove(id: number) {
    return `This action removes a #${id} crudEstado`;
  }
}
