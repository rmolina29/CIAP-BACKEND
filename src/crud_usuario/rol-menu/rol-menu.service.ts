import { HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { MensajeAlerta } from 'src/mensajes_usuario/mensajes-usuario.enum';
import { Connection } from 'mariadb';
import { RolMenu } from '../crud_rol/dto/rol.dto';
import { PermisosRol } from './dto/rol-menu.dto';
import { CrudUsuarioService } from '../crud_usuario.service';

@Injectable()
export class RolMenuService {

    // consultas
    private readonly SQL_SELECT_OBTENER_MENU = `SELECT id, descripcion, tipo_menu_id, id_menu_padre, icono, programa
                                            FROM menu 
                                            WHERE estado = 1;
                                            `;

    private readonly SQL_SELECT_OBTENER_PERMISOS_MENU = `SELECT id,permiso,abreviatura FROM menu_permisos WHERE estado = 1;

                                            `;
    private readonly SQL_SELECT_OBTENER_PERMISOS_DEL_ROL = `SELECT men.id as id_menu, men.descripcion as menu,  men.id_menu_padre,
    ifnull(t.id_rol,'NA') as id_rol,
    ifnull(t.id_permisos,'NA') as id_permiso,
    ifnull(t.permiso,'NA') as permiso,
    ifnull(t.abreviatura,'NA') as abreviatura
    FROM menu men
    LEFT JOIN (SELECT mr.usuario_rol_id  as id_rol, m.id as id_menu,m.id_menu_padre , m.descripcion as menu, mp.id as id_permisos, mp.permiso as permiso, mp.abreviatura as abreviatura
                FROM menu_rol mr
                JOIN menu m ON m.id = mr.menu_id 
                JOIN menu_permisos mp ON mp.id = mr.permiso_id 
                WHERE mr.usuario_rol_id = ? AND mr.estado = 1
                ORDER BY m.id ASC) t on t.id_menu = men.id; `;

    private readonly SQL_SELECT_OBTENER_PERMISOS_POR_ROL = 'SELECT menu_id,permiso_id  FROM menu_rol WHERE estado = 1 AND usuario_rol_id = ? ORDER BY menu_id ASC;';

    private readonly SQL_UPDATE_ACTUALIZAR_ESTADO_ROL_PERMISO = `
                                        UPDATE menu_rol
                                            SET estado = 0
                                            WHERE usuario_rol_id = ?
                                            AND menu_id IN (?)
                                            AND permiso_id IN (?)
                                    `;

    conexion: Connection;


    // servicios a usar
    constructor(private readonly dbConexionServicio: DatabaseService, private readonly crudUsuarioService: CrudUsuarioService) { }

    async obtenerMenu(): Promise<RolMenu> { // se obtiene todos los menu
        try {
            this.conexion = await this.dbConexionServicio.connectToDatabase()
            this.conexion = this.dbConexionServicio.getConnection();
            const menu = await this.conexion.query(this.SQL_SELECT_OBTENER_MENU);
            return menu;

        } catch (error) {
            console.error({ mensaje: MensajeAlerta.ERROR, err: error.message, status: HttpStatus.INTERNAL_SERVER_ERROR });
            throw new Error(`${MensajeAlerta.ERROR}, ${error.message}`);

        } finally {
            await this.dbConexionServicio.closeConnection();
        }
    }

    async obtenerPermisos() { // se obtiene todos los permisos que existen
        try {
            this.conexion = await this.dbConexionServicio.connectToDatabase()
            this.conexion = this.dbConexionServicio.getConnection();
            const permisosMenu = await this.conexion.query(this.SQL_SELECT_OBTENER_PERMISOS_MENU);
            return permisosMenu;

        } catch (error) {
            console.error({ mensaje: MensajeAlerta.ERROR, err: error.message, status: HttpStatus.INTERNAL_SERVER_ERROR });
            throw new Error(`${MensajeAlerta.ERROR}, ${error.message}`);

        } finally {
            await this.dbConexionServicio.closeConnection();
        }
    }
    // obtiene los permisos que ya estan asignados y ademas le sirve los que aun no estan asigandos los devuelve como N/A
    async obtenerPermisosDelRol(idRol: number) { // en esta consulta se obendra los permisos del cual el rol estara ligado 
        try {
            this.conexion = await this.dbConexionServicio.connectToDatabase()
            this.conexion = this.dbConexionServicio.getConnection();

            const permisosDelRol = await this.conexion.query(this.SQL_SELECT_OBTENER_PERMISOS_DEL_ROL, [idRol]);
            return permisosDelRol;

        } catch (error) {
            console.error({ mensaje: MensajeAlerta.ERROR, err: error.message, status: HttpStatus.INTERNAL_SERVER_ERROR });
            throw new Error(`${MensajeAlerta.ERROR}, ${error.message}`);

        } finally {
            await this.dbConexionServicio.closeConnection();
        }
    }

    // muestra unicamente los permisos que estan ligados al rol (id_menu y id_permiso).
    async obtenerPermisosRoles(idRol: number) {
        try {
            this.conexion = await this.dbConexionServicio.connectToDatabase()
            this.conexion = this.dbConexionServicio.getConnection();
            const permisosDelRol = await this.conexion.query(this.SQL_SELECT_OBTENER_PERMISOS_POR_ROL, [idRol]);
            return permisosDelRol;
        }
        catch (error) {
            console.error({ mensaje: MensajeAlerta.ERROR, err: error.message, status: HttpStatus.INTERNAL_SERVER_ERROR });
            throw new Error(`${MensajeAlerta.ERROR}, ${error.message}`);
        }

    }

    async actualizarPermisosRol(permisos: PermisosRol) {
        // agrupamos de los permiso que me envia el usuario el idRol y los menus 
        const { idRol, menus } = permisos;

        try {

            // permisos que envia el usuario desde la aplicacion los obtengo desde el request
            // los agrupo en un array y me quedaraia de forma [1,2,3,4] array plano.
            const permisosRolUsuario = menus.flatMap((menu) => menu.id_permisos.map((permisoId) => [menu.id_menu, permisoId])).flat();;

            // obtengo en una consulta todos los permisos que tiene actualmente el rol activos.
            const obtenerRolesPermisosAsignados: any[] = await this.obtenerPermisosRoles(idRol);


            // if (obtenerRolesPermisosAsignados.length === 0) {
            //     console.log('no existen permisos en el rol');
            //     return
            // }

            // permisos que ya estan registrados y los obtengo desde la consulta
            const permisosActualesDelRol = obtenerRolesPermisosAsignados.map(item => [item.menu_id, item.permiso_id]).flat();;

            // esto me realiza la comparacion para saber si debo actualizar o son los mismos que ya me trae por defecto.
            const existenRolesUsuario = this.crudUsuarioService.comparacionArray(permisosActualesDelRol, permisosRolUsuario)


            if (!existenRolesUsuario) {

                const rolMenuUsuario = this.compararPares(permisosActualesDelRol, permisosRolUsuario);
                const permisosRolesActualizar: number[] = rolMenuUsuario;

                console.log("actualizar: ", permisosRolesActualizar);

                if (permisosRolesActualizar.length > 0) {
                    await this.actualizarEstadoRol(idRol, permisosRolesActualizar);
                }

                const permisosRolesInsertar: number[] = this.compararPares(permisosRolUsuario, permisosActualesDelRol);
                console.log("insertar: ", permisosRolesInsertar);

                if (permisosRolesInsertar.length > 0) {
                    await this.registrarPermisosRol(idRol, permisosRolesInsertar);
                }
            }

        } catch (error) {
            console.error({ mensaje: MensajeAlerta.ERROR, err: error.message, status: HttpStatus.INTERNAL_SERVER_ERROR });
            throw new Error(`${MensajeAlerta.ERROR}, ${error.message}`);
        } finally {
            await this.dbConexionServicio.closeConnection();
        }
    }

    async actualizarEstadoRol(idRol: number, permisosRolesActualizar: number[]) {
        //Me filtra por las posiciones pares teniendo en cuenta que inicia por el 0 es decir [1,2,3,4] me devuelve el array [1,3].
        const menuId = permisosRolesActualizar.filter((_, index) => index % 2 === 0);
        //Me devuelve lo contrario, es decir las posiciones impares ejemplo -> [1,2,3,4] me devuelve el array [2,4] posicion 1 y 3.
        const permisosId = permisosRolesActualizar.filter((_, index) => index % 2 !== 0);

        try {
            await this.conexion.query(this.SQL_UPDATE_ACTUALIZAR_ESTADO_ROL_PERMISO, [idRol, menuId.join(','), permisosId.join(',')]);
        } catch (error) {

        }

    }

    async registrarPermisosRol(idRol: number, permisosRegistro: number[]) {

        // me realiza el filtro por pares y me los separa de dos datos ejemplo -> [1,2,3,4] me devolvera (1,2) (3,4)
        const permisosRolesAgregar = permisosRegistro
            .map((valor, indice, array) => (indice % 2 === 0 ? `(${idRol},${valor},${array[indice + 1]})` : null))
            .filter((par) => par !== null);


        // aqui realizo la union de los permisos por medio de "," para enviarle a la consulta todos los valores
        const valoresParaInsertarPermisos = permisosRolesAgregar.join(', ');

        try {

            const query = `INSERT INTO menu_rol (usuario_rol_id, menu_id, permiso_id) VALUES ${valoresParaInsertarPermisos}`;
            await this.conexion.query(query);

        } catch (error) {
            console.error({ mensaje: MensajeAlerta.ERROR, err: error.message, status: HttpStatus.INTERNAL_SERVER_ERROR });
            throw new Error(`${MensajeAlerta.ERROR}, ${error.message}`);
        }
    }



    compararPares(a: number[], b: number[]): any {
        const rolPermio: number[] = [];

        for (let i = 0; i < a.length; i += 2) {
            const parA = [a[i], a[i + 1]];

            // Comprobar si el par actual de a no está en b
            if (!this.existeParEnArray(parA, b)) {
                rolPermio.push(parA[0], parA[1]);
            }
        }

        return rolPermio;
    }

    // Comprueba si un par [a, b] está en el array
    existeParEnArray(par: number[], array: number[]): boolean {
        for (let i = 0; i < array.length; i += 2) {

            const parEnArray = [array[i], array[i + 1]];

            if (par[0] === parEnArray[0] && par[1] === parEnArray[1]) {
                return true;
            }
        }

        return false;
    }



}
