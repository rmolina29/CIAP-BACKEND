import { HttpStatus, Injectable } from '@nestjs/common';
import { Estado, EstadosDto } from './dto/create-crud-estado.dto';
import { DatabaseService } from 'src/database/database.service';
import { Connection } from 'mariadb';
import { MensajeAlerta } from 'src/mensajes_usuario/mensajes-usuario.enum';


@Injectable()
export class CrudEstadosService {

  private readonly SQL_OBTENER_ESTADOS = `SELECT pe.id,pe.descripcion as estados, DATE_FORMAT(pe.fechasistema, '%d/%m/%Y %H:%i') as fecha_creacion, pe.estado  
    FROM proyecto_estado pe;
   `;
  private readonly SQL_REGISTRAR_ESTADO = 'INSERT INTO proyecto_estado (descripcion,estado_id_erp) VALUES (?,?);';
  private readonly SQL_ACTUALIZAR_ESTADO = 'UPDATE proyecto_estado SET descripcion = ?, estado_id_erp = ? WHERE id = ?;';
  private readonly SQL_DESACTIVACION_ACTIVACION_ESTADO = 'UPDATE proyecto_estado SET estado = ? WHERE id = ?;';

  constructor(private readonly dbConexionServicio: DatabaseService) { }
  conexion: Connection;


  async crearEstado(estadoDto: EstadosDto) {
    try {
      const { descripcion, estadoIdErp } = estadoDto;

      this.conexion = await this.dbConexionServicio.connectToDatabase();
      this.conexion = this.dbConexionServicio.getConnection();
      await this.conexion.query(this.SQL_REGISTRAR_ESTADO, [descripcion, estadoIdErp]);

    } catch (error) {
      console.error({ mensaje: MensajeAlerta.ERROR, err: error.message, status: HttpStatus.INTERNAL_SERVER_ERROR });
      throw new Error(`${MensajeAlerta.ERROR}, ${error.message}`);
    } finally {
      await this.dbConexionServicio.closeConnection();

    }
  }

  async obtenerEstados() {
    try {
      this.conexion = await this.dbConexionServicio.connectToDatabase();
      this.conexion = this.dbConexionServicio.getConnection();

      const estados = await this.conexion.query(this.SQL_OBTENER_ESTADOS);
      return estados;

    } catch (error) {
      console.error({ mensaje: MensajeAlerta.ERROR, err: error.message, status: HttpStatus.INTERNAL_SERVER_ERROR });
      throw new Error(`${MensajeAlerta.ERROR}, ${error.message}`);
    } finally {
      await this.dbConexionServicio.closeConnection();
    }
  }

  async actualizarEstado(estadoActualizacion: Estado) {
    try {
      const { id, estado } = estadoActualizacion;

      this.conexion = await this.dbConexionServicio.connectToDatabase();
      this.conexion = this.dbConexionServicio.getConnection();
      this.conexion.query(this.SQL_DESACTIVACION_ACTIVACION_ESTADO, [estado, id]);

    } catch (error) {
      console.error({ mensaje: MensajeAlerta.ERROR, err: error.message, status: HttpStatus.INTERNAL_SERVER_ERROR });
      throw new Error(`${MensajeAlerta.ERROR}, ${error.message}`);
    } finally {
      await this.dbConexionServicio.closeConnection();

    }
  }


  async actualizar(estados: EstadosDto) {
    try {
      const { descripcion, estadoIdErp, id } = estados;

      this.conexion = await this.dbConexionServicio.connectToDatabase();
      this.conexion = this.dbConexionServicio.getConnection();

      this.conexion.query(this.SQL_ACTUALIZAR_ESTADO, [descripcion, estadoIdErp, id]);

    } catch (error) {
      console.error({ mensaje: MensajeAlerta.ERROR, err: error.message, status: HttpStatus.INTERNAL_SERVER_ERROR });
      throw new Error(`${MensajeAlerta.ERROR}, ${error.message}`);
    } finally {
      await this.dbConexionServicio.closeConnection();

    }
  }


}
