import { Injectable, OnModuleInit } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { DataLogin, DataVerificacionUsuario, RespuestaDataUsuario } from './interfaces_auth/usuario_auth_login.interface';
import { Connection } from 'mariadb';
import * as moment from 'moment-timezone';


@Injectable()
export class LoginService implements OnModuleInit {

    private conexion: Connection;
    constructor(private readonly dbConexionServicio: DatabaseService) {
    }

    async onModuleInit() {
        await this.dbConexionServicio.connectToDatabase();
    }

    async auth_login(usuario: DataLogin): Promise<any> {

        this.conexion = this.dbConexionServicio.getConnection()

        let nombre_usuario = usuario.user ?? '';
        let correo = usuario.mail ?? '';
        let contrasena = usuario.pass ?? '';

        nombre_usuario = nombre_usuario.trim();
        correo = correo.trim();
        contrasena = contrasena.trim();

        let sql = `SELECT ua.id as id_ua, ua.nombre_usuario, ua.id_rol as id_rol_usuario,ur.tipo as nombre_rol, udp.nombres ,udp.apellidos,udp.correo,urc.estado as estado_contrasena, ua.estado_bloqueo
        FROM usuario_auth ua 
        JOIN usuario_datos_personales udp ON ua.id = udp.id_usuario
        JOIN usuario_reg_contrasena urc ON ua.id = urc.id_usuario
        JOIN usuario_rol ur ON ua.id_rol = ur.id 
        WHERE (udp.correo = '${correo}' or ua.nombre_usuario = '${nombre_usuario}') and urc.contrasena = '${contrasena}'`;

        let resultado_login_auth = await this.conexion.query(sql);
        return resultado_login_auth
    }

    async verificarUsuario(usuario: DataVerificacionUsuario): Promise<Array<any>> {

        this.conexion = this.dbConexionServicio.getConnection()

        let nombre_usuario = usuario.user ?? '';
        let correo = usuario.mail ?? '';

        nombre_usuario = nombre_usuario.trim();
        correo = correo.trim();

        let sql = `
        SELECT ua.id
                FROM usuario_auth ua 
                JOIN usuario_datos_personales udp ON ua.id = udp.id_usuario
                WHERE udp.correo = '${correo}' or ua.nombre_usuario = '${nombre_usuario}' `;

        let dataUsu = await this.conexion.query(sql);
        return dataUsu;
    }


    async cuentaUsuarioBloqueo(id_usuario: number) {
        this.conexion = await this.dbConexionServicio.connectToDatabase()
        this.conexion = this.dbConexionServicio.getConnection();

        // estado que se cambia cuando el usuario realizo 3 intentos fallidos
        let estado = 1;

        let fechaDesbloqueo = this.fecha_bloqueo_usuario()

        // se actualiza el estado a usuario bloqueado 
        let sql = `UPDATE usuario_auth SET estado_bloqueo = '${estado}',tiempo_desbloqueo = '${fechaDesbloqueo}'  WHERE id = '${id_usuario}'`;

        // se ejecuta el query
        await this.conexion.query(sql);

    }

    fecha_bloqueo_usuario() {

        var fechaActualUTC = moment().utc();
        var fechaActualColombia = fechaActualUTC.tz("America/Bogota");
        var fechaExpiracion = moment(fechaActualColombia).add(30, "minutes");
        var fechaBloqueo = fechaExpiracion.format("YYYY-MM-DD HH:mm:ss");

        return fechaBloqueo
    }


}
