import { Injectable, OnModuleInit, Res } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { Connection } from 'mariadb';
import { email } from './restablecimiento_contra.interface/verificacion_correo.interface';
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
    async generar_token(id_usuario: number): Promise<object> {
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

            return {'clave':token,'fecha':fecha_expiracion}

        } catch (error) {
            console.error('Error executing query:', error);
            res.status(500).json({ mensaje: 'Error executing query' });
        }

    }

    async validarEsatdoToken(idUsuario: number) {
        try {
            this.conexion = await this.dbConexionServicio.connectToDatabase()
            this.conexion = this.dbConexionServicio.getConnection();

            let sql = `
            SELECT id,estado FROM usuario_token WHERE id_usuario = '${idUsuario}'
            ORDER BY estado DESC LIMIT 1;`;

            let usuarioVerificacionToken = await this.conexion.query(sql);

            return usuarioVerificacionToken;
        } catch (error) {
            console.error('Error executing query:', error);
            return { mensaje: 'Error executing query' };
        }

    }



    async estadoVerificado(id_usuario: number) {
        this.conexion = this.dbConexionServicio.getConnection();

        // estado que se cambia al usuario verificar los digitos que se enviaron a traves del correo
        let estado = 3;

        // se actualiza el estado a verificado 
        let sql = `UPDATE usuario_token SET estado = '${estado}' WHERE id_usuario = '${id_usuario}' ORDER BY id DESC LIMIT 1`;

        // tener presente el await
        await this.conexion.query(sql);

        return {
            estado: 'actualizado',
            token: 'ok'
        }

    }
}
