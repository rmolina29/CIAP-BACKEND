import { Injectable } from '@nestjs/common';
import { CreateCrudGerenciaDto } from './dto/create-crud-gerencia.dto';
import { UpdateCrudGerenciaDto } from './dto/update-crud-gerencia.dto';

@Injectable()
export class CrudGerenciaService {
  create(createCrudGerenciaDto: CreateCrudGerenciaDto) {
    return 'This action adds a new crudGerencia';
  }

  findAll() {
    return `This action returns all crudGerencia`;
  }

  findOne(id: number) {
    return `This action returns a #${id} crudGerencia`;
  }

  update(id: number, updateCrudGerenciaDto: UpdateCrudGerenciaDto) {
    return `This action updates a #${id} crudGerencia`;
  }

  remove(id: number) {
    return `This action removes a #${id} crudGerencia`;
  }
}
