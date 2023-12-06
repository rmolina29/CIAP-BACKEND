import { Injectable, OnModuleInit } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { Connection } from 'mariadb';
import { email } from './restablecimiento_contra.interface.ts/verificacion_correo.interface';
import * as moment from 'moment-timezone';

@Injectable()
export class RestablecimientoContrasenaService implements OnModuleInit {

    private conexion: Connection;
    constructor(private readonly dbConexionServicio: DatabaseService) {

    }

    async onModuleInit() {
        //this.conexion = await this.dbConexionServicio.connectToDatabase()
    }

    async email_usuario_existe(verificacion: email): Promise<any> {
        try {
            this.conexion = await this.dbConexionServicio.connectToDatabase()

            this.conexion = this.dbConexionServicio.getConnection();

            let mail = verificacion.mail ?? '';

            mail = mail.trim();

            let sql = `SELECT id,correo,estado FROM usuario_datos_personales WHERE correo = '${mail}'`;

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
        return Math.floor(Math.random() * 9000) + 1000;
    }

    async generar_token(id_usuario: number) {
        this.conexion = this.dbConexionServicio.getConnection();

        var token = this.token_random()
        // obtengo la fecha y les quito los espacios
        var fecha_expiracion = this.fecha_expiracion_token().trim()

        let sql = `INSERT into usuario_token (id_usuario,token,fecha_expiracion) VALUES ('${id_usuario}','${token}','${fecha_expiracion}')`;

        this.conexion.query(sql)

        return token

    }
}
