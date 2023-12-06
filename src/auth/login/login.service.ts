import { Injectable, OnModuleInit } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { DataLogin, RespuestaDataUsuario } from './interfaces_auth/usuario_auth_login.interface';
import { Connection } from 'mariadb';

@Injectable()
export class LoginService implements OnModuleInit {

    private conexion: Connection;
    constructor(private readonly dbConexionServicio: DatabaseService) {
    }

    async onModuleInit() {
        await this.dbConexionServicio.connectToDatabase();
    }

    private transformAuthLoginData(usuario: any) {
        const datosTransformados = usuario.map((item: RespuestaDataUsuario) => ({
            id_ua: item.id_ua,
            nombre_usuario: item.nombre_usuario,
            id_rol_usuario: item.id_rol_usuario,
            id_udp: item.id_udp,
            nombres: item.nombres,
            id_urc: item.id_urc,
            estado_contrasena: item.estado_contrasena.toString(),
        }));

        return datosTransformados
    }

    async auth_login(usuario: DataLogin): Promise<any> {

        this.conexion = this.dbConexionServicio.getConnection()

        let nombre_usuario = usuario.user ?? '';
        let correo = usuario.mail ?? '';
        let contrasena = usuario.pass ?? '';

        nombre_usuario = nombre_usuario.trim();
        correo = correo.trim();
        contrasena = contrasena.trim();

        let sql = `SELECT ua.id as id_ua, ua.nombre_usuario, ua.id_rol as id_rol_usuario, udp.id as id_udp, udp.nombres ,udp.apellidos,urc.id as id_urc,urc.estado as estado_contrasena
        FROM usuario_auth ua 
        JOIN usuario_datos_personales udp ON ua.id = udp.id_usuario
        JOIN usuario_reg_contrasena urc ON ua.id = urc.id_usuario
        WHERE (udp.correo = '${correo}' or ua.nombre_usuario = '${nombre_usuario}') and urc.contrasena = '${contrasena}'`;

        let resultado_login_auth = await this.conexion.query(sql);
        return this.transformAuthLoginData(resultado_login_auth);
    }


}
