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

        const { idRol, menus } = permisos;

        try {
            // const query = `INSERT INTO menu_rol (usuario_rol_id, menu_id, permisos_id) VALUES ${queryValues}`;
            // this.conexion.query(query);

            const permisosRolUsuario = menus.flatMap((menu) => menu.id_permisos.map((permisoId) => [menu.id_menu, permisoId])).flat();;

            const obtenerRolesPermisosAsignados: any[] = await this.obtenerPermisosRoles(idRol);

            if (obtenerRolesPermisosAsignados.length === 0) {
                return
            }

            const permisosActualesDelRol = obtenerRolesPermisosAsignados.map(item => [item.menu_id, item.permiso_id]).flat();;

            console.log(permisosRolUsuario);
            console.log(permisosActualesDelRol);

            // esto me realiza la comparacion para 
            const existenRolesUsuario = this.crudUsuarioService.comparacionArray(permisosRolUsuario, permisosActualesDelRol)

            if (!existenRolesUsuario) {
                const menuRolActualizacion = this.crudUsuarioService.proyectoscambio(permisosRolUsuario, permisosActualesDelRol)
                console.log(menuRolActualizacion);
            }


        } catch (error) {
            console.error({ mensaje: MensajeAlerta.ERROR, err: error.message, status: HttpStatus.INTERNAL_SERVER_ERROR });
            throw new Error(`${MensajeAlerta.ERROR}, ${error.message}`);
        } finally {
            await this.dbConexionServicio.closeConnection();
        }
    }

    async registrarPermisosRol(permisos: PermisosRol) {

        const { idRol, menus } = permisos;


        const queryValues = menus
            .flatMap((menu: { id_permisos: number[]; id_menu: number; }) => menu.id_permisos.map(permisoId => `(${idRol}, ${menu.id_menu}, ${permisoId})`))
            .join(',');

        try {
            const query = `INSERT INTO menu_rol (usuario_rol_id, menu_id, permisos_id) VALUES ${queryValues}`;
            await this.conexion.query(query);


        } catch (error) {
            console.error({ mensaje: MensajeAlerta.ERROR, err: error.message, status: HttpStatus.INTERNAL_SERVER_ERROR });
            throw new Error(`${MensajeAlerta.ERROR}, ${error.message}`);
        }
    }



}
