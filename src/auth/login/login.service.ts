import { HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { Connection } from 'mariadb';
import * as moment from 'moment-timezone';
import { DataLogin, DataVerificacionUsuario, RespuestaDataUsuario } from './dto_autenticacion/usuario_autenticacion.dto';
import { MensajeAlerta } from 'src/mensajes_usuario/mensajes-usuario.enum';


@Injectable()
export class LoginService {

    private conexion: Connection;
    constructor(private readonly dbConexionServicio: DatabaseService) {
    }

    async auth_login(usuario: DataLogin): Promise<RespuestaDataUsuario[]> {

        try {
            this.conexion = await this.dbConexionServicio.connectToDatabase()
            this.conexion = this.dbConexionServicio.getConnection();


            let nombre_usuario = usuario.user ?? '';
            let correo = usuario.mail ?? '';
            let contrasena = usuario.pass ?? '';

            nombre_usuario = nombre_usuario.trim();
            correo = correo.trim();
            contrasena = contrasena.trim();

            let sql = `SELECT ua.id as id_ua, ua.nombre_usuario, ua.id_rol as id_rol_usuario,ua.estado as bloqueo_cuenta_usuario,ur.tipo as nombre_rol, udp.nombres ,udp.apellidos,udp.correo,urc.estado as estado_contrasena,urc.tipo_contrasena, ua.estado_bloqueo,urc.fechasistema as fechaContrasena
            FROM usuario_auth ua 
            JOIN usuario_datos_personales udp ON ua.id = udp.id_usuario
            JOIN usuario_reg_contrasena urc ON ua.id = urc.id_usuario AND urc.estado = 1
            JOIN usuario_rol ur ON ua.id_rol = ur.id 
            WHERE (udp.correo = '${correo}' or ua.nombre_usuario = '${nombre_usuario}') and urc.contrasena = '${contrasena}'`;

            let resultado_login_auth = await this.conexion.query(sql);
            return resultado_login_auth


        } catch (error) {
            console.error('problema en la base de datos');
            throw new Error(error);
        } finally {
            await this.dbConexionServicio.closeConnection();
        }


    }

    // esta consulta le sirve los permisos del rol que se encuentran asignados 
    async permisoRol(idRol: number) {
        try {
            this.conexion = await this.dbConexionServicio.connectToDatabase()
            this.conexion = this.dbConexionServicio.getConnection();

            let sql = `SELECT mr.usuario_rol_id  as id_rol, m.id as id_menu,m.id_menu_padre , m.descripcion as menu, mp.id as id_permisos, mp.permiso, mp.abreviatura 
            FROM menu_rol mr
            JOIN menu m ON m.id = mr.menu_id 
            JOIN menu_permisos mp ON mp.id = mr.permiso_id 
            WHERE mr.usuario_rol_id = ${idRol} AND mr.estado = 1
            ORDER BY m.id ASC;`;

            let permisosRolUsuario = await this.conexion.query(sql);

            return permisosRolUsuario

        } catch (error) {
            console.error('problema en la base de datos');
            throw new Error('error de servidor');
        }
    }

    async verificarUsuario(usuario: DataVerificacionUsuario): Promise<Array<any>> {

        try {
            this.conexion = await this.dbConexionServicio.connectToDatabase()
            this.conexion = this.dbConexionServicio.getConnection();

            let nombre_usuario = usuario.user ?? '';
            let correo = usuario.mail ?? '';

            nombre_usuario = nombre_usuario.trim();
            correo = correo.trim();

            let sql = `
            SELECT ua.id,udp.correo,udp.nombres,udp.apellidos
                    FROM usuario_auth ua 
                    JOIN usuario_datos_personales udp ON ua.id = udp.id_usuario
                    WHERE udp.correo = '${correo}' or ua.nombre_usuario = '${nombre_usuario}' `;

            let dataUsu = await this.conexion.query(sql);

            return dataUsu;


        } catch (error) {
            console.error('problema en la base de datos');
            throw new Error('error de servidor');
        } finally {
            await this.dbConexionServicio.closeConnection();
        }


    }

    async tiempoRelogin(): Promise<string> {
        let usuarioParametrizacion = await this.usuarioParametrizacionData()
        let tiempoRelogin = usuarioParametrizacion.data.tiempo_relogin;
        return tiempoRelogin
    }

    async usuarioParametrizacionData() {
        try {
            this.conexion = await this.dbConexionServicio.connectToDatabase()
            this.conexion = this.dbConexionServicio.getConnection();

            let sql = 'SELECT * FROM usuario_parametros_login'

            let dataUsuarioParametrizacion = await this.conexion.query(sql);

            return { data: dataUsuarioParametrizacion[0] }

        } catch (error) {
            console.error('problema en la base de datos');
            throw new Error(error);
        }
    }

    async primerBloqueoUsuario(id_usuario: number): Promise<boolean> {
        try {
            this.conexion = await this.dbConexionServicio.connectToDatabase()
            this.conexion = this.dbConexionServicio.getConnection();

            const sql = `SELECT estado_bloqueo FROM usuario_auth WHERE id = ${id_usuario} `;
            const estado = await this.conexion.query(sql);
            let estadoUsuarioBloqueo = estado[0].estado_bloqueo === 0;

            return estadoUsuarioBloqueo;
        } catch (error) {
            console.error({ mensaje: MensajeAlerta.ERROR, err: error.message, status: HttpStatus.INTERNAL_SERVER_ERROR });
            throw new Error(`${MensajeAlerta.ERROR}, ${error.message}`);
        }

    }

    async cuentaUsuarioBloqueo(id_usuario: number) {
        try {
            this.conexion = await this.dbConexionServicio.connectToDatabase()
            this.conexion = this.dbConexionServicio.getConnection();

            let fechaDesbloqueo = await this.fecha_bloqueo_usuario()

            // se actualiza el estado a usuario bloqueado 
            let sql = `UPDATE usuario_auth SET estado_bloqueo = 1 ,tiempo_desbloqueo = '${fechaDesbloqueo}'  WHERE id = '${id_usuario}' AND estado_bloqueo = 0`;

            // se ejecuta el query
            let actualizacionEstado = await this.conexion.query(sql);

            if (actualizacionEstado.affectedRows > 0) {
                let fechaBloqueoUsuario = await this.conexion.query(`SELECT tiempo_desbloqueo FROM usuario_auth WHERE id = '${id_usuario}'`);
                return { 'fechaBloqueo': fechaBloqueoUsuario[0].tiempo_desbloqueo }

            } else {
                return { 'fechaBloqueo': null }
            }
            //se devuelve la fecha hasta cuando fue bloqueada la cuenta

        } catch (error) {
            console.error('problema en la base de datos');
            throw new Error(error);
        } finally {
            await this.dbConexionServicio.closeConnection();
        }

    }

    async fecha_bloqueo_usuario() {
        var dataUsuarioParametrizacion = await this.usuarioParametrizacionData()

        var tiempoRelogin = dataUsuarioParametrizacion.data.tiempo_relogin

        var fechaActualUTC = moment().utc();
        var fechaActualColombia = fechaActualUTC.tz("America/Bogota");
        var fechaExpiracion = moment(fechaActualColombia).add(tiempoRelogin, "minutes");
        var fechaBloqueo = fechaExpiracion.format("YYYY-MM-DD HH:mm:ss");

        return fechaBloqueo
    }


}
