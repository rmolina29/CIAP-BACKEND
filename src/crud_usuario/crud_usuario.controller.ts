import { Body, Controller, Get, HttpStatus, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { CrudRolService } from './crud_rol/crud_rol.service';
import { CrudUsuarioService } from './crud_usuario.service';
import { Response } from 'express';
import { DataRol, RolEstado, RolMenu, RolNombre, bodyRolRegistro, responseRolRegistro } from './crud_rol/dto/rol.dto';
import { CuentasUsuario, DatosUsuario, EstadoUsuario, InformacionProyecto, ProyectoIdUsuario, UsuarioId } from './dtoCrudUsuario/crudUser.dto';
import { MensajeAlerta, RegistroUsuario, RespuestaPeticion, TipoEstado } from 'src/mensajes_usuario/mensajes-usuario.enum';
import { EnvioCorreosService } from 'src/restablecimiento_contrasena/envio_correos/envio_correos.service';
import { ApiBody, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ValidacionService } from './validaciones_crudUsuario/validaciones_usuario_crud.service';
import { GuardsGuard } from './guards/guards.guard';
import { RolMenuService } from './rol-menu/rol-menu.service';


@Controller('/usuario')
export class CrudUsuarioController {

    constructor(private readonly validacionService: ValidacionService,
        private readonly sevicioUsuario: CrudUsuarioService,
        private readonly serivioRol: CrudRolService,
        private readonly servicioEnvioCorreo: EnvioCorreosService,
        private readonly serviciRoloMenu: RolMenuService
    ) { }
    // crud de roles 

    // se obtienen todos los roles que estan registrados
    @ApiTags('Roles')
    @Get('/roles')
    @ApiOkResponse({ type: DataRol, description: 'Respuesta exitosa' })
    async obtenerRoles(@Res() res: Response) {
        const obtenerDatosRoles: DataRol = await this.serivioRol.obtenerRoles()
        res.status(HttpStatus.OK).json(obtenerDatosRoles)
    }

    // se crean los roles
    @ApiTags('Roles')
    @Post('/rol/registro')
    @ApiBody({ type: bodyRolRegistro, description: 'Obtiene todos los roles ya esten activos o inactivos.' })
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
            console.error(error.message);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ mensaje: MensajeAlerta.UPS, err: error.message });
        }

    }

    // se actualiza el nombre del rol

    @ApiTags('Roles')
    @Put('/rol/nombre')
    @ApiBody({ type: RolNombre, description: 'Se actualizara el rol del nombre por medio el id y el nuevo nombre a actualizar.' })
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
            console.error(error.message);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ mensaje: MensajeAlerta.UPS, err: error.message });
        }

    }

    // se actualiza el estado del rol a descativado o activado

    @ApiTags('Roles')
    @Put('/rol/estado')
    @ApiBody({ type: RolEstado, description: 'Se actualizara el estado rol del rol para activar o desactivar.' })
    async actualizarEstado(@Body() rol: RolEstado, @Res() res: Response) {
        try {
            // validacion de que el usuario le envie un id rol que exista y que valide si hay un usuario ligado con esta id.
            const validacionRol = await this.validacionService.rolActualizar(rol);

            if (!validacionRol.success) {
                return res.status(validacionRol.status).json(validacionRol);
            }
            
            await this.serivioRol.actualizarEstadoRol(rol);

            const response = rol.estado === TipoEstado.ACTIVO ? 'rol activado' : 'rol desactivado';
            res.status(HttpStatus.OK).json({
                status: 'ok',
                mensaje: 'Rol actualizado',
                rol: response,
            });

        } catch (error) {
            console.error(error.message);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ mensaje: MensajeAlerta.UPS, err: error.message });
        }
    }

    // rol menu
    @ApiTags('Roles')
    @Get('/rol/menu')
    @ApiBody({ description: 'Se obtiene la informacion del menu de los roles.' })
    async rolMenu(@Res() res: Response) {
        try {
            // .
            const datosMenu = await this.serviciRoloMenu.obtenerMenu();
            res.status(HttpStatus.OK).json(datosMenu);

        } catch (error) {
            console.error(error.message);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ mensaje: MensajeAlerta.UPS, err: error.message });
        }
    }
    // rol permisos asignados
    @ApiTags('Roles')
    @Get('/rol/menu-permisos')
    @ApiBody({ description: 'Se obtiene la informacion de de los permisos que se le podran asignar a los roles.' })
    async menuPermisos(@Res() res: Response) {
        try {
            // .
            const datosMenuPermiso = await this.serviciRoloMenu.obtenerPermisos();
            res.status(HttpStatus.OK).json(datosMenuPermiso);

        } catch (error) {
            console.error(error.message);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ mensaje: MensajeAlerta.UPS, err: error.message });
        }
    }

    @ApiTags('Roles')
    @Get('/rol/permisos')
    @ApiQuery({
        name: 'id',
        type: 'number',
        description: 'el id del rol para obtener los permisos.',
        example: 1,
        required: true,
    })
    @ApiOkResponse({ description: 'Respuesta exitosa' })
    async permisosRol(@Query('id') idRol: number, @Res() res: Response) {
        try {
            // .
            const datosRolPermisos = await this.serviciRoloMenu.obtenerPermisosDelRol(idRol);
            res.status(HttpStatus.OK).json(datosRolPermisos);

        } catch (error) {
            console.error(error.message);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ mensaje: MensajeAlerta.UPS, err: error.message });
        }
    }

    @ApiTags('Roles')
    @Post('/rol/permisos')
    @ApiOkResponse({ description: 'Respuesta exitosa' })
    async RegistrarPermisosRol(@Body() permisos: any, @Res() res: Response) {
        try {
            // .

        } catch (error) {
            console.error(error.message);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ mensaje: MensajeAlerta.UPS, err: error.message });
        }
    }

    // crud de usuarios
    // Se registrara el usuario, rol asignado al usuario y proyectos
    @ApiTags('Usuarios')
    @Post('/registrar')
    @UseGuards(GuardsGuard)
    @ApiBody({ type: DatosUsuario, description: 'Se hara el registro de ususarios.' })
    async crearUsuario(@Body() usuario: DatosUsuario, @Res() res: Response) {
        try {
            // const validacionesRegistro = await this.validacionService.excepcionesRegistroUsuarios(usuario);
            // if (!validacionesRegistro.success) {
            //     return res.status(validacionesRegistro.status).json(validacionesRegistro);

            // }
            const datosUsuario = await this.sevicioUsuario.registrarUsuario(usuario);
            const htmlCuerpoRegistro = this.servicioEnvioCorreo.CuerpoRegistroUsuario(datosUsuario.nuevoNombreUsuario, datosUsuario.contrasenaUsuario, usuario);
            this.servicioEnvioCorreo.envio_correo(htmlCuerpoRegistro, usuario.correo);

            res.status(HttpStatus.OK).json({ mensaje: RegistroUsuario.EXITOSO, status: RespuestaPeticion.OK });
        } catch (error) {
            console.error(error.message);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ mensaje: MensajeAlerta.UPS, err: error.message });
        }
    }

    @ApiTags('Usuarios')
    @Put('/actualizar')
    @UseGuards(GuardsGuard)
    @ApiBody({ type: DatosUsuario, description: 'Se hara la actualizacion de ususarios.' })
    async actualizarInformacionUsuario(@Body() usuario: DatosUsuario, @Res() res: Response) {
        try {
            // obtiene las validaciones de si el usuario no cotenga informacion que ya este registrada
            // const validacionActualizacion = await this.validacionService.excepcionesRegistroUsuarios(usuario);

            // if (!validacionActualizacion.success) {
            //     return res.status(validacionActualizacion.status).json(validacionActualizacion);
            // }

            await this.sevicioUsuario.actualizarUsuarios(usuario);
            res.status(HttpStatus.OK).json({ id: usuario.idUsuario, mensaje: "usuario actualizado exitosamente.", status: RespuestaPeticion.OK });
        } catch (error) {
            res.status(error.status).json({ err: MensajeAlerta.UPS, mensaje: error.message, status });
        }

    }

    // mostrar todos los usuarios
    @ApiTags('Usuarios')
    @Get('/cuentas-usuario')
    @ApiOkResponse({ type: CuentasUsuario, description: 'Respuesta exitosa' })
    async usuarios(@Res() res: Response) {
        const obtenerUsuarios: CuentasUsuario = await this.sevicioUsuario.obtenerUsuarios();
        res.status(HttpStatus.OK).json(obtenerUsuarios);
    }

    // desactiva y activa cuenta del usuario
    @ApiTags('Usuarios')
    @Put('/actualizar/cuenta')
    @ApiBody({ type: EstadoUsuario, description: 'Se realiza la activacion o desactivacion de la cuenta del usuario.' })
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
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ mensaje: MensajeAlerta.UPS, err: error.message });
        }

    }

    @ApiTags('Proyectos-usuarios')
    @Get('/proyectos')
    @ApiOkResponse({ description: 'Respuesta exitosa' })
    async obtenerListaProyecto(@Res() res: Response) {
        try {
            const obtenerProyectos: any = await this.sevicioUsuario.obtenerProyectosActivos();
            res.status(HttpStatus.OK).json(obtenerProyectos)

        } catch (error) {
            console.error(error.message);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ mensaje: MensajeAlerta.UPS, err: error.message });
        }

    }

    @ApiTags('Proyectos-usuarios')
    @Get('/proyectos-de-usuario')
    @ApiQuery({
        name: 'id',
        type: 'number',
        description: 'ID del usuario para obtener información de proyectos activos',
        example: 8,
        required: true,
    })
    @ApiOkResponse({ type: InformacionProyecto, description: 'Respuesta exitosa' })
    async obtenerListaProyectoUsuario(@Query('id') idUsuario: number, @Res() res: Response) {
        // Tu lógica para obtener la lista de proyectos por usuario
        const listaProyectos: InformacionProyecto = await this.sevicioUsuario.obtenerProyectosUsuario(idUsuario);
        res.status(HttpStatus.OK).json(listaProyectos);
    }


}


