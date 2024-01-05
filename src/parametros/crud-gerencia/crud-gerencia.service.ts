import { HttpStatus, Injectable } from '@nestjs/common';
import { Gerencia, Estado } from './dto/create-crud-gerencia.dto';
import { DatabaseService } from 'src/database/database.service';
import { MensajeAlerta } from 'src/mensajes_usuario/mensajes-usuario.enum';
import { Connection } from 'mariadb';

@Injectable()
export class CrudGerenciaService {

  private readonly SQL_OBTENER_GERENCIA = `
  SELECT  pug.id as idGerencia,pug.unidad_gerencia_id_erp as gerencia, pug.nombre as gerencia, ua.nombre_usuario as responsable,ua.id as id_responsable, DATE_FORMAT(pug.fechasistema, '%d/%m/%Y %H:%i') as fecha_creacion, pug.estado
  FROM proyecto_unidad_gerencia pug 
   JOIN usuario_auth ua ON pug.responsable_id = ua.id
  `;

  private readonly SQL_OBTENER_GERENCIA_ACTIVAS = `
      SELECT pug.id as idGerencia, pug.nombre as Gerencia 
      FROM proyecto_unidad_gerencia pug WHERE pug.estado = 1;  
  `;

  private readonly SQL_OBTENER_LISTADO_RESPONSABLES = 'SELECT id,nombre_usuario as nombreUsuario FROM usuario_auth ua WHERE estado = 1;';

  private readonly SQL_REGISTRAR_UNIDAD_DE_GERENCIA = "INSERT INTO proyecto_unidad_gerencia (unidad_gerencia_id_erp,nombre,responsable_id) VALUES (?,?,?)";

  private readonly SQL_ACTUALIZAR_UNIDAD_DE_GERENCIA = "UPDATE proyecto_unidad_gerencia SET unidad_gerencia_id_erp = ?, nombre = ?, responsable_id = ? WHERE id = ?;";

  private readonly SQL_ACTUALIZAR_ESTADO_DE_GERENCIA = "UPDATE proyecto_unidad_gerencia SET estado = ? WHERE id = ?;";

  constructor(private readonly dbConexionServicio: DatabaseService) { }

  private conexion: Connection;

  async registrar(gerenciaDto: Gerencia) {
    try {
      const { idGerenciaErp, nombre, idResponsable } = gerenciaDto

      this.conexion = await this.dbConexionServicio.connectToDatabase();
      this.conexion = this.dbConexionServicio.getConnection();

      await this.conexion.query(this.SQL_REGISTRAR_UNIDAD_DE_GERENCIA, [idGerenciaErp, nombre, idResponsable]);

    } catch (error) {
      console.error({ mensaje: MensajeAlerta.ERROR, err: error.message, status: HttpStatus.INTERNAL_SERVER_ERROR });
      throw new Error(`${MensajeAlerta.ERROR}, ${error.message}`);
    } finally {
      await this.dbConexionServicio.closeConnection();

    }
  }

  async obtenerGerencias() {
    try {
      this.conexion = await this.dbConexionServicio.connectToDatabase();
      this.conexion = this.dbConexionServicio.getConnection();

      const gerencias = await this.conexion.query(this.SQL_OBTENER_GERENCIA);
      return gerencias

    } catch (error) {
      console.error({ mensaje: MensajeAlerta.ERROR, err: error.message, status: HttpStatus.INTERNAL_SERVER_ERROR });
      throw new Error(`${MensajeAlerta.ERROR}, ${error.message}`);
    } finally {
      await this.dbConexionServicio.closeConnection();
    }
  }
  async obtenerGerenciasActivas() {
    try {
      this.conexion = await this.dbConexionServicio.connectToDatabase();
      this.conexion = this.dbConexionServicio.getConnection();

      const gerenciasActivas = await this.conexion.query(this.SQL_OBTENER_GERENCIA_ACTIVAS);
      return gerenciasActivas

    } catch (error) {
      console.error({ mensaje: MensajeAlerta.ERROR, err: error.message, status: HttpStatus.INTERNAL_SERVER_ERROR });
      throw new Error(`${MensajeAlerta.ERROR}, ${error.message}`);
    } finally {
      await this.dbConexionServicio.closeConnection();
    }
  }

  async obtenerResponsables() {
    try {
      this.conexion = await this.dbConexionServicio.connectToDatabase();
      this.conexion = this.dbConexionServicio.getConnection();

      const responsables = await this.conexion.query(this.SQL_OBTENER_LISTADO_RESPONSABLES);

      return responsables

    } catch (error) {
      console.error({ mensaje: MensajeAlerta.ERROR, err: error.message, status: HttpStatus.INTERNAL_SERVER_ERROR });
      throw new Error(`${MensajeAlerta.ERROR}, ${error.message}`);
    } finally {
      await this.dbConexionServicio.closeConnection();
    }
  }


  async actualizar(updateCrudGerenciaDto: Gerencia) {
    try {

      const { idGerenciaErp, nombre, idResponsable, id } = updateCrudGerenciaDto
      this.conexion = await this.dbConexionServicio.connectToDatabase();
      this.conexion = this.dbConexionServicio.getConnection();
      await this.conexion.query(this.SQL_ACTUALIZAR_UNIDAD_DE_GERENCIA, [idGerenciaErp, nombre, idResponsable, id]);

    } catch (error) {
      console.error({ mensaje: MensajeAlerta.ERROR, err: error.message, status: HttpStatus.INTERNAL_SERVER_ERROR });
      throw new Error(`${MensajeAlerta.ERROR}, ${error.message}`);
    } finally {
      await this.dbConexionServicio.closeConnection();
    }
  }

  async actualizarEstado(estado: Estado) {
    try {
      const { idGerencia, estadoGerencia } = estado;

      this.conexion = await this.dbConexionServicio.connectToDatabase();
      this.conexion = this.dbConexionServicio.getConnection();
      this.conexion.query(this.SQL_ACTUALIZAR_ESTADO_DE_GERENCIA, [estadoGerencia, idGerencia]);

    } catch (error) {
      console.error({ mensaje: MensajeAlerta.ERROR, err: error.message, status: HttpStatus.INTERNAL_SERVER_ERROR });
      throw new Error(`${MensajeAlerta.ERROR}, ${error.message}`);
    } finally {
      await this.dbConexionServicio.closeConnection();

    }
  }
}
