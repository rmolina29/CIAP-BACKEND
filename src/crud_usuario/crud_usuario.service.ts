import { HttpStatus, Injectable } from '@nestjs/common';
import { Connection } from 'mariadb';
import { DatabaseService } from 'src/database/database.service';
import { CuentasUsuario, DatosUsuario, EstadoUsuario, ProyectosActivos, UsuarioId } from './dtoCrudUsuario/crudUser.dto';
import { sha256 } from 'js-sha256';
import * as randomatic from 'randomatic';
import { MensajeAlerta } from 'src/mensajes_usuario/mensajes-usuario.enum';
import { isEqual } from 'lodash';

@Injectable()
export class CrudUsuarioService {

    private readonly SQL_INSERT_USUARIO = `INSERT INTO usuario_auth (nombre_usuario,id_rol) VALUES (?,?)`;
    private readonly SQL_INSERT_CONTRASENA = `INSERT INTO usuario_reg_contrasena (id_usuario, contrasena) VALUES (?, ?)`;
    private readonly SQL_INSERT_DATOS_PERSONALES = `INSERT INTO usuario_datos_personales (id_usuario, identificacion, nombres, apellidos, correo) VALUES (?, ?, ?, ?, ?)`;
    private readonly SQL_ACTUALIZAR_DATOS_PEROSONALES = `UPDATE usuario_datos_personales SET identificacion = ? ,nombres = ? ,apellidos = ?, correo = ? , ultimo_actualizacion = NOW()  WHERE id_usuario = ?`
    private readonly SQL_ACTUALIZAR_ROL_USUARIO = `UPDATE usuario_auth SET id_rol = ? WHERE id = ?`;
    private readonly SQL_CUENTAS_USUARIO = `SELECT ua.id as id_usuario, ua.nombre_usuario as usuario, udp.identificacion, udp.nombres as nombre, udp.apellidos,udp.correo,ur.id as id_rol, ur.tipo as rol ,ua.estado
    FROM usuario_auth ua 
    JOIN usuario_datos_personales udp ON ua.id = udp.id_usuario
    JOIN usuario_rol ur ON ua.id_rol = ur.id 
    ORDER BY ua.id;`;

    private readonly SQL_CUENTAS_USUARIO_POR_ID = `  SELECT ua.id as id_usuario, ua.nombre_usuario as usuario, udp.identificacion, udp.nombres as nombre, udp.apellidos,udp.correo,ur.id as id_rol, ur.tipo as rol ,ua.estado
    FROM usuario_auth ua 
    JOIN usuario_datos_personales udp ON ua.id = udp.id_usuario
    JOIN usuario_rol ur ON ua.id_rol = ur.id 
    WHERE id_usuario = ?
    ORDER BY ua.id;`;

    private readonly SQL_ACTUALIZAR_ESTADO_CUENTA = "UPDATE usuario_auth set estado = ? WHERE id = ?"

    private readonly SQL_SELECT_PROYECTOS_POR_USUARIO = `SELECT up.proyecto_id,p.nombre 
                                                        FROM usuario_proyecto up
                                                        JOIN proyecto p ON up.proyecto_id = p.id 
                                                        WHERE  up.usuario_id  = ? AND up.estado = 1;`

    private readonly SQL_UPDATE_DESACTIVAR_PROYECTOS_USUARIO = `UPDATE usuario_proyecto
                                                                SET estado = 0
                                                                WHERE usuario_id = ?
                                                                AND proyecto_id IN (?);`

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
            //nombre usuario de la persona que se registrara
            let nuevoNombreUsuario = await this.nombreUsuario(usuario);

            let nombreUsu = await this.conexion.query(this.SQL_INSERT_USUARIO, [nuevoNombreUsuario, usuario.idRol]);
            let idUsuario: string = nombreUsu.insertId.toString();

            let contrasenaUsuario = await this.registrarContrasena(idUsuario);
            await this.registroDatosPersonales(idUsuario, usuario);
            await this.registroProyectoUsuario(idUsuario, usuario.idProyecto);

            return { nuevoNombreUsuario, contrasenaUsuario };

        } catch (error) {
            console.error({ mensaje: MensajeAlerta.ERROR, err: error.message, status: HttpStatus.INTERNAL_SERVER_ERROR });
            throw new Error(`${MensajeAlerta.ERROR}, ${error.message}`);

        } finally {
            await this.dbConexionServicio.closeConnection();
        }
    }

    async registrarContrasena(usuarioContrasena: string): Promise<string> {
        let contrasenaGeneracion = this.generarContrasena()

        const contrasenaEncriptada = contrasenaGeneracion[0];
        const contrasenaUsuario = contrasenaGeneracion[1]

        await this.conexion.query(this.SQL_INSERT_CONTRASENA, [usuarioContrasena, contrasenaEncriptada]);

        // se le envia la contrasena no encriptada para usarla en la autenticacion
        return contrasenaUsuario;
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



    //validacion de comprobar si existe un proyecto
    async existeProyecto(idProyectos: number[]): Promise<boolean> {

        let obtenerProyectos = await this.obtenerProyectosActivos();
        let idProyectosExistentes: number[] = obtenerProyectos.map((proyecto: { id: number; }) => proyecto.id);

        const existeProyectos = idProyectos.every(elemento => idProyectosExistentes.includes(elemento));

        return existeProyectos
    }

    // servicio para obtener los usuarios
    async registroProyectoUsuario(idUsuario: string, idProyectos: number[]): Promise<void> {
        try {
            this.conexion = await this.dbConexionServicio.connectToDatabase()
            this.conexion = this.dbConexionServicio.getConnection();
            // se actualizara la informacion de datos personales 

            // aqui se realizara la concatenacion de proyectos dependiendo la cantidad de proyectos que se seleccionen
            const posicionesDeProyectos = idProyectos.map(() => '(?,?)').join(',');

            // lo agregaremos en los values para tener en cuenta la n posiciones que tendra
            const sql = `INSERT INTO usuario_proyecto (usuario_id, proyecto_id) VALUES ${posicionesDeProyectos}`;

            // aqui mapeo la n cantidad de proyectos que se le asignara 
            const datosProyectosUsuario = idProyectos.flatMap(proyectoId => [idUsuario, proyectoId]);

            await this.conexion.query(sql, datosProyectosUsuario)

        } catch (error) {
            console.error({ mensaje: MensajeAlerta.ERROR, err: error.message, status: HttpStatus.INTERNAL_SERVER_ERROR });
            throw new Error(`${MensajeAlerta.ERROR}, ${error.message}`);
        }
    }

    async obtenerUsuarios(): Promise<CuentasUsuario> {
        try {
            this.conexion = await this.dbConexionServicio.connectToDatabase()
            this.conexion = this.dbConexionServicio.getConnection();
            const usuarios = await this.conexion.query(this.SQL_CUENTAS_USUARIO);
            return usuarios

        } catch (error) {
            console.error({ mensaje: MensajeAlerta.ERROR, err: error.message, status: HttpStatus.INTERNAL_SERVER_ERROR });
            throw new Error(`${MensajeAlerta.ERROR}, ${error.message}`);
        } finally {
            await this.dbConexionServicio.closeConnection();
        }
    }
    async obtenerUsuario(id: number): Promise<CuentasUsuario> {
        try {
            this.conexion = await this.dbConexionServicio.connectToDatabase()
            this.conexion = this.dbConexionServicio.getConnection();
            const usuario = await this.conexion.query(this.SQL_CUENTAS_USUARIO_POR_ID, [id]);
            return usuario;

        } catch (error) {
            console.error({ mensaje: MensajeAlerta.ERROR, err: error.message, status: HttpStatus.INTERNAL_SERVER_ERROR });
            throw new Error(`${MensajeAlerta.ERROR}, ${error.message}`);
        } finally {
            await this.dbConexionServicio.closeConnection();
        }
    }


    async obtenerProyectosUsuario(idUsuario: number) {
        try {
            this.conexion = await this.dbConexionServicio.connectToDatabase()
            this.conexion = this.dbConexionServicio.getConnection();
            // se actualizara la informacion de datos personales 
            const usuarioProyectos = await this.conexion.query(this.SQL_SELECT_PROYECTOS_POR_USUARIO, [idUsuario]);
            // se actualiza el rol
            const proyectosActivos = usuarioProyectos.length > 0 ? usuarioProyectos : { mensaje: 'no se encontraron proyectos activos con referente a este usuario.', status: 'ok' };

            return proyectosActivos;

        } catch (error) {
            console.error({ mensaje: MensajeAlerta.ERROR, err: error.message, status: HttpStatus.INTERNAL_SERVER_ERROR });
            throw new Error(`${MensajeAlerta.ERROR}, ${error.message}`);
        }
    }

    //actualizar usuario
    async actualizarUsuarios(usuario: DatosUsuario): Promise<any> {
        try {
            this.conexion = await this.dbConexionServicio.connectToDatabase()
            this.conexion = this.dbConexionServicio.getConnection();


            // se actualizara la informacion de datos personales

            await this.conexion.query(this.SQL_ACTUALIZAR_DATOS_PEROSONALES, [usuario.identificacion, usuario.nombres, usuario.apellidos, usuario.correo, usuario.idUsuario]);
            // se actualiza el rol
            await this.actualizarRolUsuario(usuario.idRol, usuario.idUsuario);
            // se actualizan los proyectos si no son los mismos que estan agregados
            await this.actualizarProyectoUsuario(usuario);

        } catch (error) {
            console.error({ mensaje: MensajeAlerta.ERROR, err: error.message, status: HttpStatus.INTERNAL_SERVER_ERROR });
            throw new Error(`${MensajeAlerta.ERROR}, ${error.message}`);
        } finally {
            await this.dbConexionServicio.closeConnection();
        }
    }

    async actualizarProyectoUsuario(usuario: DatosUsuario) {

        const proyectosusuario = await this.obtenerProyectosUsuario(usuario.idUsuario);

        let idProyectosExistentes: number[] = proyectosusuario.map((proyecto: { proyecto_id: number; }) => proyecto.proyecto_id);
        const existeProyectos = this.comparacionProyectosUsuario(idProyectosExistentes, usuario.idProyecto)

        if (idProyectosExistentes.length === 0) {
            return
        }

        // se valida si hay algun cambio en los proyectos
        if (!existeProyectos) {
            await this.proyectoActualizacionPorUsuario(usuario, idProyectosExistentes);
        }
    }


    // se hace la comparacion entre los proyectos de bd asignados a los usuarios con los que se actualizaran
    comparacionProyectosUsuario = (proyectosExistentes: any[], proyectosActualizar: any[]): boolean => {
        const ProyectosA = new Set(proyectosExistentes);
        const ProyectosB = new Set(proyectosActualizar);

        return proyectosExistentes.length === proyectosActualizar.length && [...ProyectosA].every(elemento => ProyectosB.has(elemento));
    };


    // Aqui se hara el proceso para comparar los proyectos de los usuario de los cuales estan indicados como activos en la bd contra los proyectos que me envia el usuario 
    proyectoscambio(proyectosParaFiltro: number[], proyectosComparacion: number[]) {
        const proyectosUsuarios = proyectosComparacion.filter(conjuntoIdProyectos => !proyectosParaFiltro.includes(conjuntoIdProyectos));
        return proyectosUsuarios;
    }

    async proyectoActualizacionPorUsuario(usuario: DatosUsuario, idProyectosExistentes: number[]) {

        let idUsuario = usuario.idUsuario.toString();
        // comparacion entre los proyetcos que tiene asignado el usuario contra los proyectos que se actualizaran, me devolvera los proyectos que no estan asignados en la actualizacion
        const proyectosActualizar = this.proyectoscambio(usuario.idProyecto, idProyectosExistentes)
        // se registra los nuevos proyectos y a los otros se le asignara estado 0 es decir desactivados

        if (proyectosActualizar.length > 0) {
            await this.conexion.query(this.SQL_UPDATE_DESACTIVAR_PROYECTOS_USUARIO, [idUsuario, proyectosActualizar.join(', ')])
        }

        // realiza la comparacion de los proyectos nuevos en comparacion a los que ya tiene asignados el usuario y le devolvera los que no se encuentran asignados
        const nuevosProyectos = this.proyectoscambio(idProyectosExistentes, usuario.idProyecto)
        if (nuevosProyectos.length > 0) {
            await this.registroProyectoUsuario(idUsuario, nuevosProyectos);
        }
    }
    //actualizar usuario
    async actualizarEstadoUsuario(estado: EstadoUsuario): Promise<void> {
        try {
            this.conexion = await this.dbConexionServicio.connectToDatabase()
            this.conexion = this.dbConexionServicio.getConnection();
            // se actualizara el estado activado o desahbilitacion de la cuenta de usuario
            await this.conexion.query(this.SQL_ACTUALIZAR_ESTADO_CUENTA, [estado.idEstado, estado.idUsuario]);

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

    async obtenerProyectosActivos(): Promise<ProyectosActivos> {
        try {
            this.conexion = await this.dbConexionServicio.connectToDatabase()
            this.conexion = this.dbConexionServicio.getConnection();


            let sql = `SELECT id,nombre  FROM proyecto WHERE estado = 1;`;

            let proyectosActivos = await this.conexion.query(sql);
            return proyectosActivos;

        } catch (error) {
            console.error({ mensaje: MensajeAlerta.ERROR, err: error.message, status: HttpStatus.INTERNAL_SERVER_ERROR });
            throw new Error(`${MensajeAlerta.ERROR}, ${error.message}`);
        }
    }


}
