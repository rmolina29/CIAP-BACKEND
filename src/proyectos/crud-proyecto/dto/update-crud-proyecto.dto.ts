import { PartialType } from '@nestjs/mapped-types';
import { Proyectos } from './create-crud-proyecto.dto';

export class ActualizarProyectos extends PartialType(Proyectos) {}
