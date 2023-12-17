import { Body, Controller, Get, HttpStatus, NotFoundException, Post, Put, Res } from '@nestjs/common';
import { CrudRolService } from './crud_rol/crud_rol.service';
import { CrudUsuarioService } from './crud_usuario.service';

import { Response } from 'express';
import { DataRol, RolEstado, RolNombre, bodyRolRegistro, responseRolRegistro } from './crud_rol/dto/rol.dto';

@Controller('/usuario')
export class CrudUsuarioController {

    constructor(private readonly sevicioUsuario: CrudUsuarioService, private readonly serivioRol: CrudRolService) { }


    @Get('/roles')
    async obtenerRoles(@Res() res: Response) {
        const obtenerDatosRoles: DataRol = await this.serivioRol.obtenerRoles()
        res.status(HttpStatus.OK).json(obtenerDatosRoles)
    }
    
    @Post('/rol/registro')
    async rolRegistro(@Body() body: bodyRolRegistro, @Res() res: Response) {

        try {
            let nombreRol = body.nombreRol;

            const verificacionExisteRol = await this.serivioRol.verificacionRolExiste(nombreRol);

            const respuestaRegistro: responseRolRegistro = verificacionExisteRol ?
                {
                    status: 'no',
                    mensaje: `el rol ${nombreRol} ya existe.`,
                    respuestHttp: HttpStatus.OK
                } :
                (
                    await this.serivioRol.regisrtrarRol(nombreRol),
                    {
                        status: 'ok',
                        mensaje: `el rol ${nombreRol} se ha registrado correctamente.`,
                        respuestHttp: HttpStatus.ACCEPTED
                    }
                )

            res.status(respuestaRegistro.respuestHttp).json(respuestaRegistro)

        } catch (error) {
            console.error('problema en la respuesta del controller');
            throw new Error(`error de servidor: ${error}`);
        }

    }



    @Put('/rol/nombre')
    async actualizarRol(@Body() rol: RolNombre, @Res() res: Response) {
        try {
            let nombre = rol.nombreRol;

            const verificacionExisteRol = await this.serivioRol.verificacionRolExiste(nombre);

            const mensaje = verificacionExisteRol ? {
                status: 'no', mensaje: `el rol ${nombre} ya existe, no se puede actualizar.`,
            } : (
                await this.serivioRol.actualizarNombreRol(rol),
                {
                    status: 'ok', mensaje: `el rol ${nombre} asignado se ha actualizado correctamente.`
                }
            );

            res.status(HttpStatus.OK).json(mensaje)

        } catch (error) {
            console.error('problema en la respuesta del controller');
            throw new Error(`error de servidor: ${error}`);
        }

    }

    @Put('/rol/estado')
    async actualizarEstado(@Body() rol: RolEstado, @Res() res: Response) {
        try {
            const ExisteIdRol = await this.serivioRol.ExisteIdRol(rol.idRol)

            if (ExisteIdRol) {
                throw new NotFoundException(`El id del rol '${rol.idRol}' no existe.`);
            }
            
            await this.serivioRol.actualizarEstadoRol(rol);

            const response = rol.estado === 1 ? 'rol activado' : 'rol desactivado';
            res.status(HttpStatus.OK).json({
                status: 'ok',
                mensaje: 'Rol actualizado',
                rol: response,
            });

        } catch (error) {
            console.error('Problema en la respuesta del controlador', error.message);
            res.status(error.getStatus()).json({
                status: 'error',
                mensaje: error.message,
            });
        }
    }
}
