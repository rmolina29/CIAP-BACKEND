import { Body, Controller, Get, HttpStatus, NotFoundException, Post, Put, Res } from '@nestjs/common';
import { CrudRolService } from './crud_rol/crud_rol.service';
import { CrudUsuarioService } from './crud_usuario.service';
import { Response } from 'express';
import { DataRol, RolEstado, RolNombre, bodyRolRegistro, responseRolRegistro } from './crud_rol/dto/rol.dto';
import { DatosUsuario } from './dtoCrudUsuario/crudUser.dto';
import { MensajeAlerta, RespuestaPeticion } from 'src/mensjaes_usuario/mensajes-usuario.enum';

@Controller('/usuario')
export class CrudUsuarioController {

    constructor(private readonly sevicioUsuario: CrudUsuarioService, private readonly serivioRol: CrudRolService) { }
    // crud de roles 

    // se obtienen todos los roles que estan registrados
    @Get('/roles')
    async obtenerRoles(@Res() res: Response) {
        const obtenerDatosRoles: DataRol = await this.serivioRol.obtenerRoles()
        res.status(HttpStatus.OK).json(obtenerDatosRoles)
    }

    // se crean los roles
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

    // se actualiza el nombre del rol
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

    // se actualiza el estado del rol a descativado o activado
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

    // crud de usuarios
    // Se registrara el usuario
    @Post('/registrar')
    async crearUsuario(@Body() usuario: DatosUsuario, @Res() res: Response) {
        try {
            await this.excepcionesRegistroUsuarios(usuario);
            const idUsuarioInsert = await this.sevicioUsuario.registrarUsuario(usuario);
            res.status(HttpStatus.OK).json({ id: idUsuarioInsert, status: RespuestaPeticion.OK });
        } catch (error) {
            console.error('Error executing query:', error.message);
            res.status(error.getStatus()).json({ mensaje: MensajeAlerta.UPS, err: error.message });
        }

    }

    // mostrar todos los usuarios
    @Get('/listar')
    async usuarios(@Res() res: Response) {
        const obtenerUsuarios: any = await this.sevicioUsuario.obtenerUsuarios();
        res.status(HttpStatus.OK).json(obtenerUsuarios);
    }

    @Put('/actualizar')
    async actualizarInformacionUsuario(@Body() usuario: DatosUsuario, @Res() res: Response) {
        try {
            await this.excepcionesRegistroUsuarios(usuario);
            await this.sevicioUsuario.actualizarUsuarios(usuario);
            res.status(HttpStatus.OK).json({ id: usuario.idUsuario, status: RespuestaPeticion.OK });
        } catch (error) {
            console.error(error.message);
            res.status(error.getStatus()).json({ mensaje: MensajeAlerta.UPS, err: error.message });
        }

    }

    // aqui se hara la validaciones la cual vamos a atrapar las excepciones del registro de usuario, teniendo en cuenta todas las posibilidades
    // posibles que hay teniendo en cuenta si el rol existe, el numero de identificacion y el correo
    async excepcionesRegistroUsuarios(usuario: DatosUsuario): Promise<void> {

        const ExisteIdRol = await this.serivioRol.ExisteIdRol(usuario.idRol);

        const existeIdentificacion = await this.sevicioUsuario.existeIdentificacion(usuario.identificacion, usuario.idUsuario);

        const existeEmail = await this.sevicioUsuario.existeEmail(usuario.correo, usuario.idUsuario);


        switch (true) {
            case ExisteIdRol && existeIdentificacion && existeEmail:
                throw new NotFoundException(`El id del rol '${usuario.idRol}' no existe y la identificación ${usuario.identificacion} ya se encuentra asignada.`);
            case ExisteIdRol && existeIdentificacion:
                throw new NotFoundException(`El id del rol '${usuario.idRol}' no existe y la identificación ${usuario.identificacion} ya se encuentra asignada.`);
            case ExisteIdRol && existeEmail:
                throw new NotFoundException(`El id del rol '${usuario.idRol}' no existe y el correo ${usuario.correo} ya se encuentra asociado a un usuario.`);
            case ExisteIdRol:
                throw new NotFoundException(`El id del rol '${usuario.idRol}' no existe.`);
            case existeIdentificacion && existeEmail:
                throw new NotFoundException(`La identificación '${usuario.identificacion}' y el correo ${usuario.correo} ya se encuentran asociados a otro usuario.`);
            case existeIdentificacion:
                throw new NotFoundException(`La identificación '${usuario.identificacion}' ya se encuentra asociada a un usuario.`);
            case existeEmail:
                throw new NotFoundException(`El correo ${usuario.correo} ya se encuentra asociado a un usuario.`);
            default:
        }
    }

}
