import { HttpStatus, Injectable } from '@nestjs/common';
import { Ceco, CecoEstado } from './dto/create-crud-ceco.dto';
import { UpdateCrudCecoDto } from './dto/update-crud-ceco.dto';
import { DatabaseService } from 'src/database/database.service';
import { Connection } from 'mariadb';
import { MensajeAlerta } from 'src/mensajes_usuario/mensajes-usuario.enum';

@Injectable()
export class CrudCecoService {

  private readonly SQL_OBTENER_CECO = `SELECT pc.id as idCeco, pc.nombre as consecutivo,pc.descripcion,DATE_FORMAT(pc.fechasistema, '%d/%m/%Y %H:%i') as fecha_creacion,pc.estado FROM proyecto_ceco pc 

  `;
  private readonly SQL_ACTUALIZAR_ESTADO_CECO = `UPDATE proyecto_ceco SET estado = ? WHERE id = ?;

  `;
  private readonly SQL_REGISTRAR_CECO = `INSERT INTO proyecto_ceco (ceco_id_erp,nombre,descripcion) VALUES (?,?,?);

  `;
  private readonly SQL_ACTUALIZAR_CECO = `UPDATE proyecto_ceco SET ceco_id_erp = ?, nombre = ?, descripcion = ?  WHERE id = ?;

  `;

  constructor(private readonly dbConexionServicio: DatabaseService) { }
  conexion: Connection;


  async registrarCeco(ceco: Ceco) {
    try {
      const { idCecoErp, nombre, descripcion } = ceco

      this.conexion = await this.dbConexionServicio.connectToDatabase();
      this.conexion = this.dbConexionServicio.getConnection();

      await this.conexion.query(this.SQL_REGISTRAR_CECO, [idCecoErp, nombre, descripcion]);

    } catch (error) {
      console.error({ mensaje: MensajeAlerta.ERROR, err: error.message, status: HttpStatus.INTERNAL_SERVER_ERROR });
      throw new Error(`${MensajeAlerta.ERROR}, ${error.message}`);
    } finally {
      await this.dbConexionServicio.closeConnection();

    }
  }

  async actualizarCeco(ceco: Ceco) {
    try {
      const { idCecoErp, nombre, descripcion, id } = ceco
      this.conexion = await this.dbConexionServicio.connectToDatabase();
      this.conexion = this.dbConexionServicio.getConnection();
      await this.conexion.query(this.SQL_ACTUALIZAR_CECO, [idCecoErp, nombre, descripcion, id]);

    } catch (error) {
      console.error({ mensaje: MensajeAlerta.ERROR, err: error.message, status: HttpStatus.INTERNAL_SERVER_ERROR });
      throw new Error(`${MensajeAlerta.ERROR}, ${error.message}`);
    } finally {
      await this.dbConexionServicio.closeConnection();
    }
  }

  async ceco() {
    try {
      this.conexion = await this.dbConexionServicio.connectToDatabase();
      this.conexion = this.dbConexionServicio.getConnection();

      const ceco = await this.conexion.query(this.SQL_OBTENER_CECO);
      return ceco;

    } catch (error) {
      console.error({ mensaje: MensajeAlerta.ERROR, err: error.message, status: HttpStatus.INTERNAL_SERVER_ERROR });
      throw new Error(`${MensajeAlerta.ERROR}, ${error.message}`);
    } finally {
      await this.dbConexionServicio.closeConnection();
    }
  }


  async actualizarEstado(estado: CecoEstado) {
    try {
      const { idCeco, estadoCeco } = estado;

      this.conexion = await this.dbConexionServicio.connectToDatabase();
      this.conexion = this.dbConexionServicio.getConnection();
      this.conexion.query(this.SQL_ACTUALIZAR_ESTADO_CECO, [estadoCeco, idCeco]);

    } catch (error) {
      console.error({ mensaje: MensajeAlerta.ERROR, err: error.message, status: HttpStatus.INTERNAL_SERVER_ERROR });
      throw new Error(`${MensajeAlerta.ERROR}, ${error.message}`);
    } finally {
      await this.dbConexionServicio.closeConnection();

    }
  }
}
