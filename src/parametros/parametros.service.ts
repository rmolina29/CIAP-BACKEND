import { HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { Connection } from 'mariadb';
import { MensajeAlerta } from 'src/mensajes_usuario/mensajes-usuario.enum';
import { Gerencia } from './crud-gerencia/dto/create-crud-gerencia.dto';
import { DireccionDto } from './crud-direccion/dto/create-crud-direccion.dto';
import { Ceco } from './crud-ceco/dto/create-crud-ceco.dto';
import { Cliente } from './crud-cliente/dto/create-crud-cliente.dto';
import { EstadosDto } from './crud-estados/dto/create-crud-estado.dto';

@Injectable()
export class ParametrosService {

  constructor(private readonly dbConexionServicio: DatabaseService) { }
  conexion: Connection;

  async validacionParametros(parametro: Gerencia & DireccionDto & Ceco & Cliente & EstadosDto) {
    try {

      this.conexion = await this.dbConexionServicio.connectToDatabase();
      this.conexion = this.dbConexionServicio.getConnection();

      const idParametro = parametro.id ?? 0;

      let parametrizacionValidacion = this.obtenerSQL(parametro);

      let parametros = parametro.nombre || parametro.identificacion || parametro.descripcion;

      const existeParametro: [] = await this.conexion.query(parametrizacionValidacion.sql, [parametros, idParametro]);

      return { validacion: existeParametro.length > 0, mensaje: parametrizacionValidacion.mensaje };

    } catch (error) {
      console.error({ mensaje: MensajeAlerta.ERROR, err: error.message, status: HttpStatus.INTERNAL_SERVER_ERROR });
      throw new Error(`${MensajeAlerta.ERROR}, ${error.message}`);
    } finally {
      await this.dbConexionServicio.closeConnection();
    }
  }


  // en esta validacion se hara la parametrizacion de que el nombre del registro sea unico es decir, no se repita mas de 1 vez
  // el cual a traves del valor que me mandan validamos cual es la informacion que me envian y a que guardian va a apuntar la consulta.

  obtenerSQL(objetoParametro: Gerencia & DireccionDto & Ceco & Cliente & EstadosDto) {
    let sql: string;
    let mensaje: string;
    switch (true) {
      case objetoParametro.hasOwnProperty('idGerenciaErp'):
        sql = 'SELECT * FROM proyecto_unidad_gerencia WHERE nombre = ? AND id != ?';
        mensaje = `La unidad de gerencia ${objetoParametro.nombre} ya se encuentra registrado, Intentar con uno diferente.`;
        break;
      case objetoParametro.hasOwnProperty('idDireccionErp'):
        sql = 'SELECT puo.id, puo.nombre as direccion FROM proyecto_unidad_organizativa puo WHERE puo.nombre = ? AND puo.id != ?';
        mensaje = `La unidad de organizativa ${objetoParametro.nombre} ya se encuentra registrado, Intentar con uno diferente.`;
        break;
      case objetoParametro.hasOwnProperty('idCecoErp'):
        sql = 'SELECT pc.nombre  FROM proyecto_ceco pc WHERE pc.nombre = ? AND pc.id != ?;';
        mensaje = `El ceco ${objetoParametro.nombre} ya se encuentra registrado, Intentar con uno diferente.`;
        break;
      case objetoParametro.hasOwnProperty('identificacion'):
        sql = 'SELECT * FROM proyecto_cliente pc WHERE pc.identificacion = ? AND pc.id != ?;';
        mensaje = `El NIT: ${objetoParametro.identificacion} ya se encuentra registrada, Intentar con una diferente.`;
        break;
      case objetoParametro.hasOwnProperty('descripcion'):
        sql = ' SELECT * FROM proyecto_estado pe WHERE pe.descripcion = ? AND pe.id != ?;';
        mensaje = `El tipo de estado: ${objetoParametro.descripcion} ya se encuentra registrado, Intentar con una diferente.`;
        break;
    }

    return { sql, mensaje };
  }



}
