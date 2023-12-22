import { Body, Controller, Get, HttpStatus, NotFoundException, Post, Put, Res } from '@nestjs/common';
import { CrudRolService } from './crud_rol/crud_rol.service';
import { CrudUsuarioService } from './crud_usuario.service';
import { Response } from 'express';
import { DataRol, RolEstado, RolNombre, bodyRolRegistro, responseRolRegistro } from './crud_rol/dto/rol.dto';
import { CuentasUsuario, DatosUsuario, EstadoUsuario, ProyectoIdUsuario, UsuarioId } from './dtoCrudUsuario/crudUser.dto';
import { MensajeAlerta, RegistroUsuario, RespuestaPeticion, TipoEstado } from 'src/mensajes_usuario/mensajes-usuario.enum';
import { EnvioCorreosService } from 'src/restablecimiento_contrasena/envio_correos/envio_correos.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Usuarios')
@Controller('/usuario')
export class CrudUsuarioController {

    constructor(private readonly sevicioUsuario: CrudUsuarioService, private readonly serivioRol: CrudRolService, private readonly servicioEnvioCorreo: EnvioCorreosService) { }
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
            // validacion de que el usuario le envie un id rol que exista y que valide si hay un usuario ligado con esta id.
            await this.validacionRolActualizar(rol);
            await this.serivioRol.actualizarEstadoRol(rol);

            const response = rol.estado === TipoEstado.ACTIVO ? 'rol activado' : 'rol desactivado';
            res.status(HttpStatus.OK).json({
                status: 'ok',
                mensaje: 'Rol actualizado',
                rol: response,
            });

        } catch (error) {
            console.error('Problema en la respuesta del controlador', error.message);
            res.status(error.getStatus()).json({
                status: 'no',
                mensaje: error.message,
            });
        }
    }

    // crud de usuarios
    // Se registrara el usuario, rol asignado al usuario y proyectos
    @Post('/registrar')
    async crearUsuario(@Body() usuario: DatosUsuario, @Res() res: Response) {
        try {
            await this.excepcionesRegistroUsuarios(usuario);

            const datosUsuario = await this.sevicioUsuario.registrarUsuario(usuario);
            const htmlCuerpoRegistro = this.servicioEnvioCorreo.CuerpoRegistroUsuario(datosUsuario.nuevoNombreUsuario, datosUsuario.contrasenaUsuario, usuario);
            this.servicioEnvioCorreo.envio_correo(htmlCuerpoRegistro, usuario.correo);

            res.status(HttpStatus.OK).json({ mensaje: RegistroUsuario.EXITOSO, status: RespuestaPeticion.OK });
        } catch (error) {
            console.error('Error executing query:', error.message);
            res.status(error.getStatus()).json({ mensaje: MensajeAlerta.UPS, err: error.message });
        }
    }

    @Put('/actualizar')
    async actualizarInformacionUsuario(@Body() usuario: DatosUsuario, @Res() res: Response) {
        try {
            await this.excepcionesRegistroUsuarios(usuario);
            await this.sevicioUsuario.actualizarUsuarios(usuario);
            res.status(HttpStatus.OK).json({ id: usuario.idUsuario, mensaje: "usuario actualizado exitosamente.", status: RespuestaPeticion.OK });
        } catch (error) {
            if (error instanceof NotFoundException)
                console.error(error.message);
            res.status(error.status).json({ err: MensajeAlerta.UPS, mensaje: error.message,status });
        }

    }

    // mostrar todos los usuarios
    @Get('/cuentas-usuario')
    async usuarios(@Res() res: Response) {
        const obtenerUsuarios: CuentasUsuario = await this.sevicioUsuario.obtenerUsuarios();
        res.status(HttpStatus.OK).json(obtenerUsuarios);
    }
    // mostrar todos los usuarios
    @Get('/cuenta-usuario')
    async usuario(@Body() usuario: UsuarioId, @Res() res: Response) {
        const obtenerUsuario: CuentasUsuario = await this.sevicioUsuario.obtenerUsuario(usuario.id);
        res.status(HttpStatus.OK).json(obtenerUsuario);
    }

    // desactiva y activa cuenta del usuario
    @Put('/actualizar/cuenta')
    async actualizarEstadoCuenta(@Body() estado: EstadoUsuario, @Res() res: Response) {
        try {
            await this.sevicioUsuario.actualizarEstadoUsuario(estado);

            const response = estado.idEstado === TipoEstado.INACTIVO ? 'cuenta de usuario inactiva' : 'cuenta de usuario activa';
            res.status(HttpStatus.OK).json({
                status: RespuestaPeticion.OK,
                mensaje: response,
            });

        } catch (error) {
            console.error(error.message);
            res.status(error.getStatus()).json({ mensaje: MensajeAlerta.UPS, err: error.message });
        }

    }

    @Get('/proyectos')
    async obtenerListaProyecto(@Res() res: Response) {
        try {
            const obtenerProyectos = await this.sevicioUsuario.obtenerProyectosActivos();
            res.status(HttpStatus.OK).json(obtenerProyectos)

        } catch (error) {
            console.error(error.message);
            res.status(error.getStatus()).json({ mensaje: MensajeAlerta.UPS, err: error.message });
        }

    }
    @Get('/proyectos-de-usuario')
    async obtenerListaProyectoUsuario(@Body() usuario: ProyectoIdUsuario, @Res() res: Response) {
        try {
            const obtenerProyectosDelUsuario = await this.sevicioUsuario.obtenerProyectosUsuario(usuario.idUsuario);
            res.status(HttpStatus.OK).json(obtenerProyectosDelUsuario)

        } catch (error) {
            console.error(error.message);
            res.status(error.getStatus()).json({ mensaje: MensajeAlerta.UPS, err: error.message });
        }

    }

    async validarIdRol(idRol: number): Promise<void> {
        const existeIdRol = await this.serivioRol.ExisteIdRol(idRol);
        if (existeIdRol) {
            throw new NotFoundException(`El id del rol '${idRol}' no existe.`);
        }
    }

    async validarIdentificacion(identificacion: string, idUsuario: number): Promise<void> {
        const existeIdentificacion = await this.sevicioUsuario.existeIdentificacion(identificacion, idUsuario);
        if (existeIdentificacion) {
            throw new NotFoundException(`La identificación '${identificacion}' ya se encuentra asociada a un usuario.`);
        }
    }

    async validarEmail(correo: string, idUsuario: number): Promise<void> {
        const existeEmail = await this.sevicioUsuario.existeEmail(correo, idUsuario);
        if (existeEmail) {
            throw new NoAutorizadoException(`El correo '${correo}' ya se encuentra asociado a un usuario.`);
        }
    }

    async validarProyecto(idProyecto: number[]): Promise<void> {
        const existeProyecto = await this.sevicioUsuario.existeProyecto(idProyecto);
        if (!existeProyecto) {
            throw new NotFoundException('Por favor, verifique que los proyectos existan.');
        }
    }

    async excepcionesRegistroUsuarios(usuario: DatosUsuario): Promise<void> {
        await this.validarIdRol(usuario.idRol);
        await this.validarIdentificacion(usuario.identificacion, usuario.idUsuario);
        await this.validarEmail(usuario.correo, usuario.idUsuario);
        await this.validarProyecto(usuario.idProyecto);
    }


    async validacionRolActualizar(rol: RolEstado): Promise<void> {
        const ExisteIdRol = await this.serivioRol.ExisteIdRol(rol.idRol)
        const ValidacionRoLigado = await this.serivioRol.existeusuarioLigadoRol(rol.idRol)

        switch (true) {
            case ExisteIdRol:
                throw new NotFoundException(`El id del rol '${rol.idRol}' no existe y el rol .`);
            case ValidacionRoLigado:
                throw new NotFoundException(`Este rol no se puede deshabilitar, debido a que se encuentra asociad usuarios activos.`);
            default:
        }

    }

}


class NoAutorizadoException extends Error {
    status: number;
    constructor(message: string = "No tienes autorización para realizar esta acción") {
        super(message);
        this.name = "NoAutorizadoException";
        this.status = 401;
    }
}
