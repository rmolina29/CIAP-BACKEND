import { Injectable } from '@nestjs/common';
import { CreateCrudDireccionDto } from './dto/create-crud-direccion.dto';
import { UpdateCrudDireccionDto } from './dto/update-crud-direccion.dto';

@Injectable()
export class CrudDireccionService {
  create(createCrudDireccionDto: CreateCrudDireccionDto) {
    return 'This action adds a new crudDireccion';
  }

  findAll() {
    return `This action returns all crudDireccion`;
  }

  findOne(id: number) {
    return `This action returns a #${id} crudDireccion`;
  }

  update(id: number, updateCrudDireccionDto: UpdateCrudDireccionDto) {
    return `This action updates a #${id} crudDireccion`;
  }

  remove(id: number) {
    return `This action removes a #${id} crudDireccion`;
  }
}
