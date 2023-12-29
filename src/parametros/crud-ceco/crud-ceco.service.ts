import { Injectable } from '@nestjs/common';
import { CreateCrudCecoDto } from './dto/create-crud-ceco.dto';
import { UpdateCrudCecoDto } from './dto/update-crud-ceco.dto';

@Injectable()
export class CrudCecoService {
  create(createCrudCecoDto: CreateCrudCecoDto) {
    return 'This action adds a new crudCeco';
  }

  findAll() {
    return `This action returns all crudCeco`;
  }

  findOne(id: number) {
    return `This action returns a #${id} crudCeco`;
  }

  update(id: number, updateCrudCecoDto: UpdateCrudCecoDto) {
    return `This action updates a #${id} crudCeco`;
  }

  remove(id: number) {
    return `This action removes a #${id} crudCeco`;
  }
}
