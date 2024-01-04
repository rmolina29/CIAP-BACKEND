import { HttpStatus, Injectable } from '@nestjs/common';
import { Proyectos } from './dto/create-crud-proyecto.dto';
import { ActualizarProyectos } from './dto/update-crud-proyecto.dto';
import { Connection } from 'mariadb';
import { DatabaseService } from 'src/database/database.service';
import { MensajeAlerta } from 'src/mensajes_usuario/mensajes-usuario.enum';

@Injectable()
export class CrudProyectoService {
  private readonly SQL_OBTENER_PROYECTOS = `
  SELECT p.id, pe.descripcion  as estado,p.contrato as numero_contrato,p.objeto, p.nombre AS cliente,
  pug.nombre as gerencia,CONCAT(udp.nombres, ' ', udp.apellidos) as gerente,p.valor_inicial,p.valor_final,
  p.duracion,DATE_FORMAT(p.fecha_inicio, '%Y-%m-%d') as fecha_inicio,DATE_FORMAT(p.fecha_final, '%Y-%m-%d') as fecha_final,p.estado as estado_proyecto
    FROM proyecto p 
        JOIN proyecto_ceco pc ON p.ceco_id = pc.id 
        JOIN proyecto_cliente pcl ON p.cliente_id = pcl.id 
        JOIN proyecto_estado pe ON p.estado_id = pe.id 
        JOIN proyecto_unidad_gerencia pug ON p.unidad_gerencia_id  = pug.id 
        JOIN usuario_auth ua ON pug.responsable_id = ua.id 
        JOIN usuario_datos_personales udp ON udp.id_usuario = ua.id;
 `;

  constructor(private readonly dbConexionServicio: DatabaseService) { }
  conexion: Connection;

  registrar(createCrudProyectoDto: Proyectos) {
    return 'This action adds a new crudProyecto';
  }

  async obtener() {
    try {
      this.conexion = await this.dbConexionServicio.connectToDatabase();
      this.conexion = this.dbConexionServicio.getConnection();

      const proyectos = await this.conexion.query(this.SQL_OBTENER_PROYECTOS);
      return proyectos;

    } catch (error) {
      console.error({ mensaje: MensajeAlerta.ERROR, err: error.message, status: HttpStatus.INTERNAL_SERVER_ERROR });
      throw new Error(`${MensajeAlerta.ERROR}, ${error.message}`);
    } finally {
      await this.dbConexionServicio.closeConnection();
    }
  }


  actualizarProyectos(updateCrudProyectoDto: ActualizarProyectos) {
    return `This action updates a crudProyecto`;
  }


}
