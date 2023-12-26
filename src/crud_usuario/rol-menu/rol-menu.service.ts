import { HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { MensajeAlerta } from 'src/mensajes_usuario/mensajes-usuario.enum';
import { Connection } from 'mariadb';
import { RolMenu } from '../crud_rol/dto/rol.dto';

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

    conexion: Connection;


    // servicios a usar
    constructor(private readonly dbConexionServicio: DatabaseService) { }

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



}
