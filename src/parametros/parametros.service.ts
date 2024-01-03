import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateParametroDto } from './dto/create-parametro.dto';
import { UpdateParametroDto } from './dto/update-parametro.dto';
import { DatabaseService } from 'src/database/database.service';
import { Connection } from 'mariadb';
import { MensajeAlerta } from 'src/mensajes_usuario/mensajes-usuario.enum';
import { Gerencia } from './crud-gerencia/dto/create-crud-gerencia.dto';
import { DireccionDto } from './crud-direccion/dto/create-crud-direccion.dto';

@Injectable()
export class ParametrosService {

  constructor(private readonly dbConexionServicio: DatabaseService) { }
  conexion: Connection;

  async validacionParametros(parametro: Gerencia | DireccionDto) {
    try {

      this.conexion = await this.dbConexionServicio.connectToDatabase();
      this.conexion = this.dbConexionServicio.getConnection();

      const idParametro = parametro.id ?? 0;

      let SQL_VALIDACION_PARAMETROS = this.obtenerSQL(parametro);

      const existeParametro: [] = await this.conexion.query(SQL_VALIDACION_PARAMETROS, [parametro.nombre, idParametro]);

      return existeParametro.length > 0;

    } catch (error) {
      console.error({ mensaje: MensajeAlerta.ERROR, err: error.message, status: HttpStatus.INTERNAL_SERVER_ERROR });
      throw new Error(`${MensajeAlerta.ERROR}, ${error.message}`);
    } finally {
      await this.dbConexionServicio.closeConnection();
    }
  }


  // en esta validacion se hara la parametrizacion de que el nombre del registro sea unico es decir, no se repita mas de 1 vez
  // el cual a traves del valor que me mandan validamos cual es la informacion que me envian y a que guardian va a apuntar la consulta.

  obtenerSQL(objetoParametro: Gerencia | DireccionDto) {
    let sql: string;

    switch (true) {
      case objetoParametro.hasOwnProperty('idGerenciaErp'):
        sql = 'SELECT * FROM proyecto_unidad_gerencia WHERE nombre = ? AND id != ?';
        break;
      case objetoParametro.hasOwnProperty('idDireccionErp'):
        sql = 'SELECT puo.id, puo.nombre as direccion FROM proyecto_unidad_organizativa puo WHERE puo.nombre = ? AND puo.id != ?';
        break;
    }

    return sql;
  }

  findAll() {
    return `This action returns all parametros`;
  }

  findOne(id: number) {
    return `This action returns a #${id} parametro`;
  }

  update(id: number, updateParametroDto: UpdateParametroDto) {
    return `This action updates a #${id} parametro`;
  }


}
