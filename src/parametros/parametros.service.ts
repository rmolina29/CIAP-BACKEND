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

      let parametrizacion = this.obtenerSQL(parametro);

      let parametros: object;

      if (parametro.hasOwnProperty(parametrizacion.erp)) {
        parametros = [parametro.nombre || parametro.descripcion, parametro[parametrizacion.erp], idParametro];
      }

      const existeParametro: [] = await this.conexion.query(parametrizacion.sql, parametros);
      return { validacion: existeParametro.length > 0, mensaje: parametrizacion.mensaje };

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
    let erp: string;

    switch (true) {
      // validacion gerencia
      case objetoParametro.hasOwnProperty('idGerenciaErp'):
        sql = '  SELECT * FROM proyecto_unidad_gerencia WHERE (nombre = ? OR unidad_gerencia_id_erp = ?)  AND id != ?;';
        mensaje = `La unidad de gerencia "${objetoParametro.nombre}" y/o  el erp "${objetoParametro.idGerenciaErp}" ya se encuentra registrado,Intentar con uno diferente.`;
        erp = 'idGerenciaErp';
        break;
      case objetoParametro.hasOwnProperty('idDireccionErp'):
        sql = '  SELECT puo.id, puo.nombre as direccion FROM proyecto_unidad_organizativa puo WHERE (puo.nombre = ? OR puo.unidad_organizativa_id_erp = ?) AND puo.id != ?';
        mensaje = `La unidad de organizativa ${objetoParametro.nombre} y/o ${objetoParametro.idDireccionErp} ya se encuentra registrado, Intentar con uno diferente.`;
        erp = 'idDireccionErp';
        break;
      case objetoParametro.hasOwnProperty('idCecoErp'):
        sql = 'SELECT pc.nombre  FROM proyecto_ceco pc WHERE (pc.nombre = ? OR pc.ceco_id_erp = ?) AND pc.id != ?;';
        mensaje = `El ceco ${objetoParametro.nombre} y/o ${objetoParametro.idCecoErp} ya se encuentra registrado, Intentar con uno diferente.`;
        erp = 'idCecoErp';
        break;
      case objetoParametro.hasOwnProperty('identificacion'):
        sql = 'SELECT * FROM proyecto_cliente pc WHERE (pc.identificacion = ? OR pc.cliente_id_erp = ?) AND pc.id != ?;';
        mensaje = `El NIT: ${objetoParametro.identificacion} y/o ${objetoParametro.clienteIdErp} ya se encuentra registrada, Intentar con una diferente.`;
        erp = 'clienteIdErp';
        break;
      case objetoParametro.hasOwnProperty('descripcion'):
        sql = ' SELECT * FROM proyecto_estado pe WHERE (pe.descripcion = ? OR pe.estado_id_erp = ?) AND pe.id != ?;';
        mensaje = `El tipo de estado: ${objetoParametro.descripcion} ya se encuentra registrado, Intentar con una diferente.`;
        erp = 'estadoIdErp';
        break;
    }

    return { sql, mensaje, erp };
  }



}
