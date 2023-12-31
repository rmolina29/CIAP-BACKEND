import { Injectable, NotFoundException } from '@nestjs/common';
import { Connection } from 'mariadb';
import { DatabaseService } from 'src/database/database.service';
import { DataRol, RolEstado, RolNombre } from './dto/rol.dto';
import { Menu } from '../rol-menu/dto/rol-menu.dto';

@Injectable()
export class CrudRolService {

    private conexion: Connection;
    constructor(private readonly dbConexionServicio: DatabaseService) { }

    async registrarRol(rol: string): Promise<any> {
        try {
            this.conexion = await this.dbConexionServicio.connectToDatabase()
            this.conexion = this.dbConexionServicio.getConnection();
            await this.dbConexionServicio.beginTransaction();

            let rolRegistro = rol ?? '';

            rolRegistro = rolRegistro.trim();

            let sql = `INSERT INTO usuario_rol (tipo) VALUES ('${rolRegistro}') `;

            return await this.conexion.query(sql);

        } catch (error) {
            await this.dbConexionServicio.rollback();
            console.error('problema en la base de datos');
            throw new Error(`error de servidor: ${error}`);
        }

    }

    async verificacionRolExiste(rol: string): Promise<boolean> {
        try {
            this.conexion = await this.dbConexionServicio.connectToDatabase()

            this.conexion = this.dbConexionServicio.getConnection();

            let nombreRol = rol ?? '';

            // se le quitaran los espacios
            nombreRol = nombreRol.trim();

            //consulta para seleccionar el rol que se va a registrar y verificar si ya existe
            let sql = `SELECT id,tipo FROM usuario_rol WHERE tipo = '${nombreRol}'`;

            let existeRol = await this.conexion.query(sql);

            return existeRol.length > 0;

        } catch (error) {
            console.error('problema en la base de datos');
            throw new Error(`error de servidor: ${error}`);
        } finally {
            await this.dbConexionServicio.closeConnection();
        }

    }

    async verificacionMenuPermisoExiste(menus: Menu): Promise<boolean> {
        try {
            this.conexion = await this.dbConexionServicio.connectToDatabase()
            this.conexion = this.dbConexionServicio.getConnection();

            const menuPermisos: number[] = menus.map((menu: { id_menu: number; }) => menu.id_menu);

            const menuJoinid = menuPermisos.join(',');

            //consulta para seleccionar el rol que se va a registrar y verificar si ya existe
            let sql = `SELECT COUNT(m.id) as permiso
                        FROM menu m
                        WHERE m.id IN (${menuJoinid}) AND m.id_menu_padre != 0
                        HAVING COUNT(m.id) = ${menuPermisos.length};
            `;

            let existeMenu = await this.conexion.query(sql);

            return existeMenu.length === 0;

        } catch (error) {
            console.error('problema en la base de datos');
            throw new Error(`error de servidor: ${error}`);
        } finally {
            await this.dbConexionServicio.closeConnection();
        }

    }
    async obtenerRoles(): Promise<DataRol> {
        try {
            this.conexion = await this.dbConexionServicio.connectToDatabase()

            this.conexion = this.dbConexionServicio.getConnection();

            //consulta para seleccionar el rol que se va a registrar y verificar si ya existe
            let sql = `SELECT * FROM usuario_rol`;

            let existeRol = await this.conexion.query(sql);

            return existeRol;

        } catch (error) {
            console.error('problema en la base de datos');
            throw new Error(`error de servidor: ${error}`);
        } finally {
            await this.dbConexionServicio.closeConnection();
        }

    }

    async actualizarEstadoRol(rolEstado: RolEstado) {
        try {
            this.conexion = await this.dbConexionServicio.connectToDatabase()
            this.conexion = this.dbConexionServicio.getConnection();

            // estado que se cambia al usuario verificar los digitos que se enviaron a traves del correo
            let sql = `UPDATE usuario_rol  SET estado = '${rolEstado.estado}'  WHERE id = '${rolEstado.idRol}'`;

            await this.conexion.query(sql);

        } catch (error) {
            console.error('problema en la base de datos');
            throw new Error(`error de servidor: ${error}`);
        } finally {
            await this.dbConexionServicio.closeConnection();
        }


    }

    async ExisteIdRol(idRol: number): Promise<boolean> {
        try {
            this.conexion = await this.dbConexionServicio.connectToDatabase()
            this.conexion = this.dbConexionServicio.getConnection();

            let sql = `SELECT tipo FROM usuario_rol WHERE id = '${idRol}'`;

            const rolData = await this.conexion.query(sql);

            return rolData.length === 0;

        } catch (error) {
            console.error('problema en la base de datos');
            throw new Error(`error de servidor: ${error}`);
        }
        // } finally {
        //     await this.dbConexionServicio.closeConnection();
        // }


    }
    async actualizarNombreRol(RolNombre: RolNombre) {
        try {
            this.conexion = await this.dbConexionServicio.connectToDatabase()
            this.conexion = this.dbConexionServicio.getConnection();

            // estado que se cambia al usuario verificar los digitos que se enviaron a traves del correo
            let sql = `UPDATE usuario_rol  SET tipo = '${RolNombre.nombreRol}'  WHERE id = '${RolNombre.idRol}'`;

            await this.conexion.query(sql);

        } catch (error) {
            console.error('problema en la base de datos');
            throw new Error(`error de servidor: ${error}`);
        } finally {
            await this.dbConexionServicio.closeConnection();
        }


    }

    async existeusuarioLigadoRol(idRol: number): Promise<boolean> {
        try {
            this.conexion = await this.dbConexionServicio.connectToDatabase()
            this.conexion = this.dbConexionServicio.getConnection();

            let sql = `select nombre_usuario from usuario_auth ua where ua.id_rol ='${idRol}'`;

            const rolData = await this.conexion.query(sql);

            return rolData.length > 0;

        } catch (error) {
            console.error('problema en la base de datos');
            throw new Error(`error de servidor: ${error}`);
        }
    }

}



