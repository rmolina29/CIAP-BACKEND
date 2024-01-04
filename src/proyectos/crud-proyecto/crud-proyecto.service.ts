import { Injectable } from '@nestjs/common';
import { Proyectos } from './dto/create-crud-proyecto.dto';
import { ActualizarProyectos } from './dto/update-crud-proyecto.dto';

@Injectable()
export class CrudProyectoService {
  registrar(createCrudProyectoDto: Proyectos) {
    return 'This action adds a new crudProyecto';
  }

  obtener() {
    return `This action returns all crudProyecto`;
  }


  actualizarProyectos(updateCrudProyectoDto: ActualizarProyectos) {
    return `This action updates a crudProyecto`;
  }


}
