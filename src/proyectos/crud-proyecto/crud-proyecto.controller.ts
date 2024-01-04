import { Controller, Get, Post, Body, Put } from '@nestjs/common';
import { CrudProyectoService } from './crud-proyecto.service';
import { Proyectos } from './dto/create-crud-proyecto.dto';
import { ActualizarProyectos } from './dto/update-crud-proyecto.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Proyectos')
@Controller('proyecto')
export class CrudProyectoController {
  constructor(private readonly proyectosServicio: CrudProyectoService) { }

  @Post()
  registrarProyecto(@Body() createCrudProyectoDto: Proyectos) {
    return this.proyectosServicio.registrar(createCrudProyectoDto);
  }

  @Get('/')
  proyectos() {
    return this.proyectosServicio.obtener();
  }


  @Put()
  update(@Body() actualizarProyectos: ActualizarProyectos) {
    return this.proyectosServicio.actualizarProyectos(actualizarProyectos);
  }


}
