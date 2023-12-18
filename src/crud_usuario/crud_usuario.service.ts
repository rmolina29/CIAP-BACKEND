import { HttpStatus, Injectable } from '@nestjs/common';
import { Connection } from 'mariadb';
import { DatabaseService } from 'src/database/database.service';
import { DatosPersonales } from './dtoCrudUsuario/crudUser.dto';
import { sha256 } from 'js-sha256';
import * as randomatic from 'randomatic';
import { Response } from 'express';
import { MensajeAlerta } from 'src/mensjaes_usuario/mensajes-usuario.enum';

@Injectable()
export class CrudUsuarioService {


    private readonly SQL_INSERT_USUARIO = `INSERT INTO usuario_auth (nombre_usuario) VALUES (?)`;
    private readonly SQL_INSERT_CONTRASENA = `INSERT INTO usuario_reg_contrasena (id_usuario, contrasena) VALUES (?, ?)`;
    private readonly SQL_INSERT_DATOS_PERSONALES = `INSERT INTO usuario_datos_personales (id_usuario, identificacion, nombres, apellidos, correo) VALUES (?, ?, ?, ?, ?)`;

    private conexion: Connection;
    constructor(private readonly dbConexionServicio: DatabaseService) { }


    // con esta expresion regular verificaremos si el caracter de string que le enviamos es un numero (si es un numero te enviara true)
    esCadenaDeNumeros(cadena: string): boolean {
        return /^\d+$/.test(cadena);
    }

    async nombreUsuario(usuario: any): Promise<string> {
        // obtendremos el usuario
        let nombreUsu = usuario.nombres.charAt(0).toLowerCase() + usuario.apellidos.split(' ')[0].toLowerCase();

        let ultimoUsuario = await this.obtenerNombreUsuario(nombreUsu)

        const ultimoCaracter: string = ultimoUsuario.charAt(ultimoUsuario.length - 1);

        //verificacion de que la ultima letra del username sea un numero
        if (this.esCadenaDeNumeros(ultimoCaracter)) {
            nombreUsu = `${nombreUsu}${parseInt(ultimoCaracter) + 1}`
        } else if (ultimoUsuario) {
            nombreUsu = `${nombreUsu}1`
        }

        return nombreUsu;
    }

    // En esta funcion obtendremos el nombre del usuario el cual la consulta validara si existe o no, en este caso devolvera o el nombre de usuario si ya existe o nada
    async obtenerNombreUsuario(nombreUsuario: string) {
        try {
            this.conexion = await this.dbConexionServicio.connectToDatabase()
            this.conexion = this.dbConexionServicio.getConnection();

            nombreUsuario = nombreUsuario.trim();

            let sql = `SELECT nombre_usuario
            FROM usuario_auth
            WHERE nombre_usuario 
            LIKE '%${nombreUsuario}%'
            ORDER BY nombre_usuario  DESC 
            LIMIT 1;`;

            let nombreUsu = await this.conexion.query(sql);

            const respuestaConsultaNombre = nombreUsu.length > 0 ? nombreUsu[0].nombre_usuario : ""

            return respuestaConsultaNombre;

        } catch (error) {
            console.error('problema en la base de datos');
            throw new Error('error de servidor');
        }
    }


    // aqui recibire el objeto completo de Usuario
    async registrarUsuario(usuario: DatosPersonales) { // se realizara la insercion del registro del nombre del usuario y se obtendra el id del usuario para utilizarla en el registro de informacion personal del usuario y la contraseña
        try {
            const nuevoNombreUsuario = await this.nombreUsuario(usuario);

            const nombreUsu = await this.conexion.query(this.SQL_INSERT_USUARIO, [nuevoNombreUsuario]);
            const idUsuario: string = nombreUsu.insertId.toString();

            await this.registrarContrasena(idUsuario);
            await this.registroDatosPersonales(idUsuario, usuario);

            return idUsuario;
        } catch (error) {
            console.error({ mensaje: MensajeAlerta.ERROR, err: error.message, status: HttpStatus.INTERNAL_SERVER_ERROR });
            throw new Error(`${MensajeAlerta.ERROR}, ${error.message}`);

        } finally {
            await this.dbConexionServicio.closeConnection();
        }
    }

    async registrarContrasena(usuarioContrasena: string): Promise<void> {
        const contrasena = this.generarContrasena()[0];
        await this.conexion.query(this.SQL_INSERT_CONTRASENA, [usuarioContrasena, contrasena]);
    }

    async registroDatosPersonales(idUsuario: string, usuario: DatosPersonales): Promise<void> {
        await this.conexion.query(this.SQL_INSERT_DATOS_PERSONALES, [idUsuario, usuario.identificacion, usuario.nombres, usuario.apellidos, usuario.correo]);
    }

    // devolvemos la contraseña sin encriptar y la encriptada 
    generarContrasena(): string[] {
        const generacionContrasena = randomatic('Aa0', 8); // Genera una cadena aleatoria de 10 caracteres alfanuméricos.
        const contrasenaEncriptada = sha256(generacionContrasena); // la cadena almacenada aleatoriamente pasarla encriptada a sha256.
        return [contrasenaEncriptada, generacionContrasena]
    }

    // servicio para obtener los usuarios
    obtenerUsuarios(): any {
        throw new Error('Method not implemented.');
    }

    //actualizar usuario
    actualizarUsuarios(usuario: any): any {
        throw new Error('Method not implemented.');
    }


}
