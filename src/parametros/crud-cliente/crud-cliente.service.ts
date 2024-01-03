import { HttpStatus, Injectable } from '@nestjs/common';
import { Cliente, EstadoCLiente } from './dto/create-crud-cliente.dto';
import { DatabaseService } from 'src/database/database.service';
import { Connection } from 'mariadb';
import { MensajeAlerta } from 'src/mensajes_usuario/mensajes-usuario.enum';

@Injectable()
export class CrudClienteService {

  private readonly SQL_OBTENER_CLIENTES = `SELECT pc.id,pc.cliente_id_erp  as cliente,pc.identificacion as NIT, DATE_FORMAT(pc.fechasistema, '%d/%m/%Y %H:%i') as fecha_creacion,pc.estado
  FROM proyecto_cliente pc; `;

  private readonly SQL_REGISTRAR_CLIENTE = 'INSERT INTO proyecto_cliente (identificacion,cliente_id_erp,razon_social) VALUES (?,?,?);';
  private readonly SQL_ACTUALIZAR_CLIENTE = 'UPDATE proyecto_cliente SET identificacion = ?, cliente_id_erp = ? ,razon_social = ? WHERE id = ?;';
  private readonly SQL_ACTUALIZAR_ESTADO_CLIENTE = 'UPDATE proyecto_cliente SET estado = ? WHERE id = ?;';

  constructor(private readonly dbConexionServicio: DatabaseService) { }
  conexion: Connection;

  async actualizarEstado(estadoCliente: EstadoCLiente) {
    try {
      const { id, estado } = estadoCliente;

      this.conexion = await this.dbConexionServicio.connectToDatabase();
      this.conexion = this.dbConexionServicio.getConnection();
      this.conexion.query(this.SQL_ACTUALIZAR_ESTADO_CLIENTE, [estado, id]);

    } catch (error) {
      console.error({ mensaje: MensajeAlerta.ERROR, err: error.message, status: HttpStatus.INTERNAL_SERVER_ERROR });
      throw new Error(`${MensajeAlerta.ERROR}, ${error.message}`);
    } finally {
      await this.dbConexionServicio.closeConnection();

    }
  }

  async actualizarCliente(cliente: Cliente) {
    try {
      const { identificacion, clienteIdErp, razonSocial, id } = cliente;

      this.conexion = await this.dbConexionServicio.connectToDatabase();
      this.conexion = this.dbConexionServicio.getConnection();

      this.conexion.query(this.SQL_ACTUALIZAR_CLIENTE, [identificacion, clienteIdErp, razonSocial, id]);

    } catch (error) {
      console.error({ mensaje: MensajeAlerta.ERROR, err: error.message, status: HttpStatus.INTERNAL_SERVER_ERROR });
      throw new Error(`${MensajeAlerta.ERROR}, ${error.message}`);
    } finally {
      await this.dbConexionServicio.closeConnection();

    }
  }

  async registrarCliente(cliente: Cliente) {
    try {
      const { identificacion, clienteIdErp, razonSocial } = cliente;

      this.conexion = await this.dbConexionServicio.connectToDatabase();
      this.conexion = this.dbConexionServicio.getConnection();
      await this.conexion.query(this.SQL_REGISTRAR_CLIENTE, [identificacion, clienteIdErp, razonSocial]);

    } catch (error) {
      console.error({ mensaje: MensajeAlerta.ERROR, err: error.message, status: HttpStatus.INTERNAL_SERVER_ERROR });
      throw new Error(`${MensajeAlerta.ERROR}, ${error.message}`);
    } finally {
      await this.dbConexionServicio.closeConnection();

    }
  }

  async clientes() {
    try {
      this.conexion = await this.dbConexionServicio.connectToDatabase();
      this.conexion = this.dbConexionServicio.getConnection();

      const clientes = await this.conexion.query(this.SQL_OBTENER_CLIENTES);
      return clientes;

    } catch (error) {
      console.error({ mensaje: MensajeAlerta.ERROR, err: error.message, status: HttpStatus.INTERNAL_SERVER_ERROR });
      throw new Error(`${MensajeAlerta.ERROR}, ${error.message}`);
    } finally {
      await this.dbConexionServicio.closeConnection();
    }
  }

}
