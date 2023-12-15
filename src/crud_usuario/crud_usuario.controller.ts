import { Body, Controller, Get, Patch, Post, Put, Res } from '@nestjs/common';
import { CrudRolService } from './crud_rol/crud_rol.service';
import { CrudUsuarioService } from './crud_usuario.service';
import { DataRol, RolEstado, RolNombre, bodyRolRegistro, responseRolRegistro } from './crud_rol/rol.interface/rol.interface';
import { Response } from 'express';

@Controller('/usuario')
export class CrudUsuarioController {

    constructor(private readonly sevicioUsuario: CrudUsuarioService, private readonly serivioRol: CrudRolService) { }


    @Post('/registrarRol')
    async rolRegistro(@Body() body: bodyRolRegistro, @Res() res: Response) {

        try {
            let response: responseRolRegistro;
            let nombreRol = body.nombreRol;

            const verificacionExisteRol = await this.serivioRol.verificacionRolExiste(nombreRol);

            if (verificacionExisteRol) {
                response = {
                    status: 'no',
                    mensaje: `el rol ${nombreRol} asignado ya existe.`,
                    respuestHttp: 200
                }

            } else {
                await this.serivioRol.regisrtrarRol(nombreRol);
                response = {
                    status: 'ok',
                    mensaje: `el rol ${nombreRol} se ha registrado correctamente.`,
                    respuestHttp: 202
                }
            }

            res.status(response.respuestHttp).json(response)

        } catch (error) {
            console.error('problema en la respuesta del controller');
            throw new Error(`error de servidor: ${error}`);
        }

    }

    @Get('/obtenerRoles')
    async obtenerRoles(@Res() res: Response) {
        const obtenerRoles: DataRol = await this.serivioRol.obtenerRoles()
        res.status(200).json(obtenerRoles)
    }

    @Put('/actualizartrarRolnombre')
    async actualizarRol(@Body() rol: RolNombre, @Res() res: Response) {
        try {
            let nombre = rol.nombreRol;

            const verificacionExisteRol = await this.serivioRol.verificacionRolExiste(nombre);
            let response: responseRolRegistro;

            if (verificacionExisteRol) {
                response = {
                    status: 'no',
                    mensaje: `el rol ${nombre} ya existe, no se puede actualizar.`,
                    respuestHttp: 200
                }
            } else {
                await this.serivioRol.actualizarNombreRol(rol)
                response = {
                    status: 'ok',
                    mensaje: `el rol ${nombre} asignado se ha actualizado correctamente.`,
                    respuestHttp: 200
                }
            }

            res.status(response.respuestHttp).json(response)

        } catch (error) {
            console.error('problema en la respuesta del controller');
            throw new Error(`error de servidor: ${error}`);
        }

    }

    @Put('/actualizartrarRolEstado')
    async actualizarRolEstado(@Body() rol: RolEstado, @Res() res: Response) {
        try {
            await this.serivioRol.actualizarEstadoRol(rol)
            if (rol.estado == 1) {
                res.status(200).json({
                    status: 'ok',
                    mensaje: 'rol actualizado',
                    rol: 'rol activado'
                })
            } else {
                res.status(200).json({
                    status: 'ok',
                    mensaje: 'rol actualizado',
                    rol: 'rol desactivado'
                })
            }

        } catch (error) {
            console.error('problema en la respuesta del controller');
            throw new Error(`error de servidor: ${error}`);
        }

    }
}
