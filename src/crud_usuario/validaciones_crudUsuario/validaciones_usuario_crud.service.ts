import { Injectable } from '@nestjs/common';
import { CrudUsuarioService } from '../crud_usuario.service';
import { CrudRolService } from '../crud_rol/crud_rol.service';
import { DatosUsuario } from '../dtoCrudUsuario/crudUser.dto';
import { RolEstado } from '../crud_rol/dto/rol.dto';
import { Menu } from '../rol-menu/dto/rol-menu.dto';

@Injectable()
export class ValidacionService {

    constructor(private readonly sevicioUsuario: CrudUsuarioService, private readonly serivioRol: CrudRolService) { }

    async validarIdRol(idRol: number): Promise<{ success: boolean, status?: number, message?: string }> {
        const existeIdRol = await this.serivioRol.ExisteIdRol(idRol);
        if (existeIdRol) {
            return { success: false, status: 404, message: `El id del rol '${idRol}' no existe.` };
        }
        return { success: true };
    }

    async validardRolExiste(nombreRol: string): Promise<{ success: boolean, status?: number, message?: string }> {
        const existeIdRol = await this.serivioRol.verificacionRolExiste(nombreRol);
        if (existeIdRol) {
            return { success: false, status: 404, message: `El rol '${nombreRol}' ya se encuentra registrado.` };
        }
        return { success: true };
    }
    async validardMenuExiste(menus: Menu): Promise<{ success: boolean, status?: number, message?: string }> {
        const existeMenu = await this.serivioRol.verificacionMenuPermisoExiste(menus);
        if (existeMenu) {
            return { success: false, status: 404, message: `Se ha encontrado un menu que no se le pueden otrogar permisos.` };
        }
        return { success: true };
    }


    async validarIdentificacion(identificacion: string, idUsuario: number): Promise<{ success: boolean, status?: number, message?: string }> {
        const existeIdentificacion = await this.sevicioUsuario.existeIdentificacion(identificacion, idUsuario);
        if (existeIdentificacion) {
            return { success: false, status: 400, message: `La identificación '${identificacion}' ya se encuentra asociada a un usuario.` };
        }
        return { success: true };
    }

    async validarEmail(correo: string, idUsuario: number): Promise<{ success: boolean, status?: number, message?: string }> {
        const existeEmail = await this.sevicioUsuario.existeEmail(correo, idUsuario);
        if (existeEmail) {
            return { success: false, status: 401, message: `El correo '${correo}' ya se encuentra asociado a un usuario.` };
        }
        return { success: true };
    }

    async validarProyecto(idProyecto: number[]): Promise<{ success: boolean, status?: number, message?: string }> {
        const existeProyecto = await this.sevicioUsuario.existeProyecto(idProyecto);
        if (!existeProyecto) {
            return { success: false, status: 404, message: 'Por favor, verifique que los proyectos existan.' };
        }
        return { success: true };
    }

    async validarProyectoExisteUsuario(idUsuario: number): Promise<{ success: boolean, status?: number, message?: string }> {
        const existeProyecto = await this.sevicioUsuario.obtenerProyectosUsuario(idUsuario);
        
        if (existeProyecto.length === 0) {
            return {
                success: false,
                message: 'El usuario no tiene proyectos asignados por favor verificar con el personal encargado',
                status: 401
            }
        }
        return { success: true };
    }

 
    async excepcionesRegistroUsuarios(usuario: DatosUsuario): Promise<{ success: boolean, status?: number, message?: string }> {

        let idUsuario = usuario.idUsuario ?? 0;

        const validacionIdRol = await this.validarIdRol(usuario.idRol);
        const validacionIdentificacion = await this.validarIdentificacion(usuario.identificacion, idUsuario);
        const validacionEmail = await this.validarEmail(usuario.correo, idUsuario);
        const validacionProyecto = await this.validarProyecto(usuario.idProyecto);
   

        if (!validacionIdRol.success) {
            return validacionIdRol;
        }

        if (!validacionIdentificacion.success) {
            return validacionIdentificacion;
        }

        if (!validacionEmail.success) {
            return validacionEmail;
        }

        if (!validacionProyecto.success) {
            return validacionProyecto;
        }

        return { success: true };
    }


    async rolActualizarEstado(rol: RolEstado): Promise<{ success: boolean, status: number, message?: string, response: string }> {

        const ExisteIdRol = await this.serivioRol.ExisteIdRol(rol.idRol);
        const ValidacionRoLigado = await this.serivioRol.existeusuarioLigadoRol(rol.idRol);

        if (ExisteIdRol) {
            return { success: false, status: 404, message: `El id del rol '${rol.idRol}' no existe.`, response: 'no' };
        }

        if (ValidacionRoLigado) {
            return { success: false, status: 401, message: `Este rol no se puede deshabilitar, debido a que se encuentra asociado a usuarios activos.`, response: 'no' };
        }

        return { success: true, status: 200, response: 'ok' };
    }


}




