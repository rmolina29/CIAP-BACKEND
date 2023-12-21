import { HttpStatus, Injectable } from '@nestjs/common';
import { Connection } from 'mariadb';
import { DatabaseService } from 'src/database/database.service';
import { CuentasUsuario, DatosUsuario, EstadoUsuario, ProyectosActivos } from './dtoCrudUsuario/crudUser.dto';
import { sha256 } from 'js-sha256';
import * as randomatic from 'randomatic';
import { MensajeAlerta } from 'src/mensajes_usuario/mensajes-usuario.enum';
import { json } from 'stream/consumers';

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

    private readonly SQL_ACTUALIZAR_ESTADO_CUENTA = "UPDATE usuario_auth set estado = ? WHERE id = ?"

    private readonly SQL_SELECT_PROYECTOS_POR_USUARIO = `SELECT up.proyecto_id,p.nombre 
                                                        FROM usuario_proyecto up
                                                        JOIN proyecto p ON up.proyecto_id = p.id 
                                                        WHERE  up.usuario_id  = ? AND up.estado = 1;`

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

            let CuerpoHtmlRegistro = this.bodyRegistroUsuario(nuevoNombreUsuario, contrasenaUsuario, usuario)

            return CuerpoHtmlRegistro;

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

    bodyRegistroUsuario(nombreUsuario: string, contrasena: string, datosUsuario: DatosUsuario) {
        return `
        <div class="container">
                        <div class="container">
                            <div class="row">
                                <div class="col"></div>
                                <div class="col-10">
                                    <div class="card boderCus">
                                        <div class="card-body">
                                            <h5 class="card-title TitleCus text-center">
                                            Credenciales de acceso - CIAP
                                            </h5>
                                            <p class="card-text Saludo">
                                                <span id="Saludo">Buen día,</span>
                                                <span id="user" class="nameUser">${datosUsuario.nombres} ${datosUsuario.apellidos}</span>
                                                <span>Reciba un cordial saludo.</span>
                                            </p>
                                            <p class="card-text mensaje">
                                                A continuación, le enviamos sus credenciales de acceso a la plataforma CIAP:
                                            </p>

                                        
                                            <button type="button" class="btn btnCuston" id="toastbtn" data-bs-toggle="tooltip"
                                                data-bs-placement="right" data-bs-title="Toca para copia tu codigo">
                                                <span class="btnSpaCuston">Usuario: ${nombreUsuario}</span>
                                            </button>

                                            <button type="button" class="btn btnCuston" id="toastbtn" data-bs-toggle="tooltip"
                                                data-bs-placement="right" data-bs-title="Toca para copia tu codigo">
                                                <span class="btnSpaCuston">Contraseña: ${contrasena}</span>
                                            </button>
                
                                            <br>

                                            <p class="">
                                            Al ingresar al sistema, le solicitaremos el cambio de contraseña. 
                                            Debe tener en cuenta las políticas de seguridad que se le indicarán.
                                            </p>

                                            <br>
                                            <br>

                                            <p class="">
                                            Para acceder a la plataforma CIAP, haga clic <button type="button" class="btn btnCuston" id="toastbtn" data-bs-toggle="tooltip"
                                            href="https://chat.openai.com/c/5d2dcf31-8c31-42bc-bb52-3560974570fb"  data-bs-placement="right" data-bs-title="Toca para copia tu codigo">
                                            <span class="btnSpaCuston">click</span>
                                        </button>
                                            </p>
                
                                            <p class="note">
                                                Este mensaje de correo se le ha enviado de forma automática.
                                                Por favor, no intente enviar correos a la dirección de este
                                                mensaje.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                             
                            </div>
                        </div>
                    </div>

                    </div>
     `
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
            // se actualizara la informacion de datos personales 
            const usuarios = await this.conexion.query(this.SQL_CUENTAS_USUARIO);
            // se actualiza el rol
            return usuarios

        } catch (error) {
            console.error({ mensaje: MensajeAlerta.ERROR, err: error.message, status: HttpStatus.INTERNAL_SERVER_ERROR });
            throw new Error(`${MensajeAlerta.ERROR}, ${error.message}`);
        } finally {
            await this.dbConexionServicio.closeConnection();
        }
    }
    async obtenerUsuariosPorId(): Promise<CuentasUsuario> {
        try {
            this.conexion = await this.dbConexionServicio.connectToDatabase()
            this.conexion = this.dbConexionServicio.getConnection();
            // se actualizara la informacion de datos personales 
            const usuarios = await this.conexion.query(this.SQL_CUENTAS_USUARIO);
            // se actualiza el rol
            return usuarios

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
            return usuarioProyectos

        } catch (error) {
            console.error({ mensaje: MensajeAlerta.ERROR, err: error.message, status: HttpStatus.INTERNAL_SERVER_ERROR });
            throw new Error(`${MensajeAlerta.ERROR}, ${error.message}`);
        } finally {
            await this.dbConexionServicio.closeConnection();
        }
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
