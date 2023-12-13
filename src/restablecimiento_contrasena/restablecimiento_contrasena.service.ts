import { Injectable, Res } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { Connection } from 'mariadb';
import { email, ContrasenaUsuario, tokenValidacion, DatosToken } from './restablecimiento_contra.interface/verificacion_correo.interface';
import * as moment from 'moment-timezone';
import { Response } from 'express';

@Injectable()
export class RestablecimientoContrasenaService {

    private conexion: Connection;
    constructor(private readonly dbConexionServicio: DatabaseService) { }

    async email_usuario_existe(verificacion: email): Promise<any> {
        try {
            this.conexion = await this.dbConexionServicio.connectToDatabase()

            this.conexion = this.dbConexionServicio.getConnection();

            let mail = verificacion.mail ?? '';

            mail = mail.trim();

            let sql = `SELECT correo,id_usuario,nombres ,apellidos FROM usuario_datos_personales WHERE correo = '${mail}'`;

            let respuesta_email = await this.conexion.query(sql);

            return respuesta_email;

        } catch (error) {
            console.error('problema en la base de datos');
            throw new Error('error de servidor');
        } finally {
            await this.dbConexionServicio.closeConnection();
        }

    }

    fecha_expiracion_token() {

        var fechaActualUTC = moment().utc();
        var fechaActualColombia = fechaActualUTC.tz("America/Bogota");
        var fechaExpiracion = moment(fechaActualColombia).add(20, "minutes");
        var fechaExpiracionFormateada = fechaExpiracion.format("YYYY-MM-DD HH:mm:ss");

        return fechaExpiracionFormateada
    }

    private token_random(): number {
        let clave = Math.floor(Math.random() * 9000) + 1000;
        return clave
    }
    // revisar
    async generar_token(id_usuario: number): Promise<DatosToken> {
        let res: Response

        try {
            this.conexion = await this.dbConexionServicio.connectToDatabase()

            this.conexion = this.dbConexionServicio.getConnection();

            var token = this.token_random()
            // obtengo la fecha y les quito los espacios
            var fecha_expiracion = this.fecha_expiracion_token().trim()

            let sql = `INSERT into usuario_token (id_usuario,token,fecha_expiracion) VALUES ('${id_usuario}','${token}','${fecha_expiracion}')`;

            // tener presente el await
            await this.conexion.query(sql)

            let datosToken: DatosToken = { 'clave': token, 'fechaExpiracion': fecha_expiracion }

            return datosToken

        } catch (error) {
            console.error('Error executing query:', error);
            res.status(500).json({ mensaje: 'Error executing query' });
        }

    }

    async validarEsatdoToken(usuarioValidacionToken: tokenValidacion) {
        try {
            this.conexion = await this.dbConexionServicio.connectToDatabase()
            this.conexion = this.dbConexionServicio.getConnection();

            let sql = `
            SELECT id,estado FROM usuario_token WHERE id_usuario = '${usuarioValidacionToken.idUsuario}' and token = '${usuarioValidacionToken.tokenUsuario}'
            ORDER BY estado DESC LIMIT 1;`;

            let usuarioVerificacionToken = await this.conexion.query(sql);

            return usuarioVerificacionToken;

        } catch (error) {
            console.error('problema en la base de datos');
            throw new Error('error de servidor');
        } finally {
            await this.dbConexionServicio.closeConnection();
        }

    }

    async estadoVerificado(id_usuario: number) {
        try {
            this.conexion = await this.dbConexionServicio.connectToDatabase()
            this.conexion = this.dbConexionServicio.getConnection();

            // estado que se cambia al usuario verificar los digitos que se enviaron a traves del correo
            let estado = 1;

            // se actualiza el estado a verificado 
            let sql = `UPDATE usuario_token SET estado = '${estado}' WHERE id_usuario = '${id_usuario}' ORDER BY id DESC LIMIT 1`;

            // tener presente el await
            await this.conexion.query(sql);

        } catch (error) {
            console.error('problema en la base de datos');
            throw new Error('error de servidor');
        } finally {
            await this.dbConexionServicio.closeConnection();
        }


    }

    // se realizara una consulta el cual con el id del usuario y la contraseña si existe en la bd algun registro
    async HistorialContrasenaExiste(verificacion: ContrasenaUsuario): Promise<Boolean> {
        try {
            this.conexion = await this.dbConexionServicio.connectToDatabase()
            this.conexion = this.dbConexionServicio.getConnection();

            let contrasena = verificacion.contrasena ?? '';

            contrasena = contrasena.trim();

            let sql = `
                SELECT COUNT(*) AS count FROM usuario_reg_contrasena
                WHERE id_usuario =  '${verificacion.idUsuario}' AND contrasena  = '${contrasena}'`;

            let verificacionContrasena = await this.conexion.query(sql);

            return verificacionContrasena[0].count > 0;

        } catch (error) {
            console.error('problema en la base de datos');
            throw new Error('error de servidor');
        } finally {
            await this.dbConexionServicio.closeConnection();
        }

    }

    async actualizacionEstadoContasena(idUsuario: number): Promise<any> {
        try {
            this.conexion = await this.dbConexionServicio.connectToDatabase()
            this.conexion = this.dbConexionServicio.getConnection();

            let sql = `
                    UPDATE usuario_reg_contrasena 
                    SET estado = 0
                    WHERE id_usuario = '${idUsuario}'
                    ORDER BY fechasistema DESC 
                    LIMIT 1;
            `;

            await this.conexion.query(sql);

        } catch (error) {
            console.error('problema en la base de datos');
            throw new Error('error de servidor');
        } finally {
            await this.dbConexionServicio.closeConnection();
        }

    }

    async registroNuevaContrasena(contrasena: ContrasenaUsuario): Promise<any> {
        try {
            this.conexion = await this.dbConexionServicio.connectToDatabase()
            this.conexion = this.dbConexionServicio.getConnection();

            let idUsuario = contrasena.idUsuario;
            let nuevContrasena = contrasena.contrasena;

            let sql = ` 
                INSERT INTO usuario_reg_contrasena (id_usuario, contrasena) VALUES ('${idUsuario}', '${nuevContrasena}');
            `;
            await this.conexion.query(sql);

        } catch (error) {
            console.error('problema en la base de datos');
            throw new Error('error de servidor');
        } finally {
            await this.dbConexionServicio.closeConnection();
        }

    }
}
