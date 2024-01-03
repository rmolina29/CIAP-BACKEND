import { HttpStatus, Injectable } from '@nestjs/common';
import { DireccionDto, EstadoDireccion } from './dto/create-crud-direccion.dto';
import { Connection } from 'mariadb';
import { MensajeAlerta } from 'src/mensajes_usuario/mensajes-usuario.enum';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class CrudDireccionService {

  private readonly SQL_OBTENER_DIRECCIONES = `SELECT puo.id as idDireccion,puo.nombre as direccion,DATE_FORMAT(puo.fechasistema , '%d/%m/%Y %H:%i:%s') as fecha_crearcion FROM proyecto_unidad_organizativa puo WHERE puo.estado = 1; 
  `;

  private readonly SQL_REGISTRAR_UNIDAD_ORGANIZATIVA = "INSERT INTO proyecto_unidad_organizativa (unidad_organizativa_id_erp,nombre) VALUES (?,?);";


  private readonly SQL_ACTUALIZAR_UNIDAD_ORGANIZATIVA = `UPDATE proyecto_unidad_organizativa  SET unidad_organizativa_id_erp = ?, nombre = ? WHERE id = ?; 
  `;
  private readonly SQL_ACTUALIZAR_ESTADO_DIRECCION = `UPDATE proyecto_unidad_organizativa  SET estado = ? WHERE id = ?; 
  `;
  constructor(private readonly dbConexionServicio: DatabaseService) { }
  conexion: Connection;

  async obtenerDirecciones() {
    try {
      this.conexion = await this.dbConexionServicio.connectToDatabase();
      this.conexion = this.dbConexionServicio.getConnection();

      const direccion = await this.conexion.query(this.SQL_OBTENER_DIRECCIONES);
      return direccion;

    } catch (error) {
      console.error({ mensaje: MensajeAlerta.ERROR, err: error.message, status: HttpStatus.INTERNAL_SERVER_ERROR });
      throw new Error(`${MensajeAlerta.ERROR}, ${error.message}`);
    } finally {
      await this.dbConexionServicio.closeConnection();
    }
  }



  async registrarDireccion(direccionDto: DireccionDto) {
    try {
      const { idDireccionErp, nombre } = direccionDto

      this.conexion = await this.dbConexionServicio.connectToDatabase();
      this.conexion = this.dbConexionServicio.getConnection();

      await this.conexion.query(this.SQL_REGISTRAR_UNIDAD_ORGANIZATIVA, [idDireccionErp, nombre]);

    } catch (error) {
      console.error({ mensaje: MensajeAlerta.ERROR, err: error.message, status: HttpStatus.INTERNAL_SERVER_ERROR });
      throw new Error(`${MensajeAlerta.ERROR}, ${error.message}`);
    } finally {
      await this.dbConexionServicio.closeConnection();

    }
  }

  async actualizarDireccion(direccionDto: DireccionDto) {
    try {
      const { idDireccionErp, nombre, id } = direccionDto
      this.conexion = await this.dbConexionServicio.connectToDatabase();
      this.conexion = this.dbConexionServicio.getConnection();
      await this.conexion.query(this.SQL_ACTUALIZAR_UNIDAD_ORGANIZATIVA, [idDireccionErp, nombre, id]);

    } catch (error) {
      console.error({ mensaje: MensajeAlerta.ERROR, err: error.message, status: HttpStatus.INTERNAL_SERVER_ERROR });
      throw new Error(`${MensajeAlerta.ERROR}, ${error.message}`);
    } finally {
      await this.dbConexionServicio.closeConnection();
    }
  }


  async actualizarEstado(estado: EstadoDireccion) {
    try {
      const { idDireccion, estadoDireccion } = estado;

      this.conexion = await this.dbConexionServicio.connectToDatabase();
      this.conexion = this.dbConexionServicio.getConnection();
      this.conexion.query(this.SQL_ACTUALIZAR_ESTADO_DIRECCION, [estadoDireccion, idDireccion]);

    } catch (error) {
      console.error({ mensaje: MensajeAlerta.ERROR, err: error.message, status: HttpStatus.INTERNAL_SERVER_ERROR });
      throw new Error(`${MensajeAlerta.ERROR}, ${error.message}`);
    } finally {
      await this.dbConexionServicio.closeConnection();

    }
  }
}
