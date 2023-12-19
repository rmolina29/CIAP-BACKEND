import { HttpStatus, Injectable } from '@nestjs/common';
import { Connection } from 'mariadb';
import { DatabaseService } from 'src/database/database.service';
import { DatosUsuario } from './dtoCrudUsuario/crudUser.dto';
import { sha256 } from 'js-sha256';
import * as randomatic from 'randomatic';
import { MensajeAlerta } from 'src/mensjaes_usuario/mensajes-usuario.enum';
import { now } from 'moment-timezone';

@Injectable()
export class CrudUsuarioService {


    private readonly SQL_INSERT_USUARIO = `INSERT INTO usuario_auth (nombre_usuario,id_rol) VALUES (?,?)`;
    private readonly SQL_INSERT_CONTRASENA = `INSERT INTO usuario_reg_contrasena (id_usuario, contrasena) VALUES (?, ?)`;
    private readonly SQL_INSERT_DATOS_PERSONALES = `INSERT INTO usuario_datos_personales (id_usuario, identificacion, nombres, apellidos, correo) VALUES (?, ?, ?, ?, ?)`;
    private readonly SQL_ACTUALIZAR_DATOS_PEROSONALES = `UPDATE usuario_datos_personales SET identificacion = ? ,nombres = ? ,apellidos = ?, correo = ? , ultimo_actualizacion = NOW()  WHERE id_usuario = ?`
    private readonly SQL_ACTUALIZAR_ROL_USUARIO = `UPDATE usuario_auth SET id_rol = ? WHERE id = ?`;

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

    async existeIdentificacion(identificacionUsuario: string, idUsuario: number): Promise<boolean> {
        try {

            this.conexion = await this.dbConexionServicio.connectToDatabase()
            this.conexion = this.dbConexionServicio.getConnection();

            let id: number = idUsuario ?? 0;

            identificacionUsuario = identificacionUsuario.trim();
            
            let sql = `SELECT id
            FROM usuario_datos_personales
            WHERE identificacion = '${identificacionUsuario}' and id_usuario != '${id}'`;


            const identificacion = await this.conexion.query(sql);
            return identificacion.length > 0;

        } catch (error) {
            console.error('problema en la base de datos');
            throw new Error('error de servidor');
        }
    }
    async existeEmail(correoUsuario: string, idUsuario: number): Promise<boolean> {
        try {
            this.conexion = await this.dbConexionServicio.connectToDatabase()
            this.conexion = this.dbConexionServicio.getConnection();

            let id: number = idUsuario ?? 0;

            let correo = correoUsuario.trim();

            let sql = `SELECT id FROM usuario_datos_personales WHERE correo = '${correo}' and id_usuario != '${id}'`;

            let identificacion = await this.conexion.query(sql);
            return identificacion.length > 0;

        } catch (error) {
            console.error('problema en la base de datos');
            throw new Error('error de servidor');
        }
    }


    // aqui recibire el objeto completo de Usuario
    async registrarUsuario(usuario: DatosUsuario) { // se realizara la insercion del registro del nombre del usuario y se obtendra el id del usuario para utilizarla en el registro de informacion personal del usuario y la contraseña
        try {
            const nuevoNombreUsuario = await this.nombreUsuario(usuario);

            const nombreUsu = await this.conexion.query(this.SQL_INSERT_USUARIO, [nuevoNombreUsuario, usuario.idRol]);
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

    async registroDatosPersonales(idUsuario: string, usuario: DatosUsuario): Promise<void> {
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
    async actualizarUsuarios(usuario: DatosUsuario): Promise<void> {
        try {

            this.conexion = await this.dbConexionServicio.connectToDatabase()
            this.conexion = this.dbConexionServicio.getConnection();

            // se actualizara la informacion de datos personales 

            await this.conexion.query(this.SQL_ACTUALIZAR_DATOS_PEROSONALES, [usuario.identificacion, usuario.nombres, usuario.apellidos, usuario.correo, usuario.idUsuario]);
            // se actualiza el rol
            await this.actualizarRolUsuario(usuario.idRol, usuario.idUsuario);

        } catch (error) {
            console.error({ mensaje: MensajeAlerta.ERROR, err: error.message, status: HttpStatus.INTERNAL_SERVER_ERROR });
            throw new Error(`${MensajeAlerta.ERROR}, ${error.message}`);
        } finally {
            await this.dbConexionServicio.closeConnection();
        }
    }


    async actualizarRolUsuario(idRol: number, idUsuario: number): Promise<void> {
        await this.conexion.query(this.SQL_ACTUALIZAR_ROL_USUARIO, [idRol, idUsuario]);
    }


}
