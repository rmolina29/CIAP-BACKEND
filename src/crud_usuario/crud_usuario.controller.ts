import { Body, Controller, Get, HttpStatus, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { CrudRolService } from './crud_rol/crud_rol.service';
import { CrudUsuarioService } from './crud_usuario.service';
import { Response } from 'express';
import { DataRol, RolEstado, RolMenu, RolNombre, bodyRolRegistro, responseRolRegistro } from './crud_rol/dto/rol.dto';
import { CuentasUsuario, DatosUsuario, EstadoUsuario, InformacionProyecto, ProyectoIdUsuario, UsuarioId } from './dtoCrudUsuario/crudUser.dto';
import { MensajeAlerta, Registro, RespuestaPeticion, TipoEstado } from 'src/mensajes_usuario/mensajes-usuario.enum';
import { EnvioCorreosService } from 'src/envio_correos/envio_correos.service';
import { ApiBody, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ValidacionService } from './validaciones_crudUsuario/validaciones_usuario_crud.service';
import { GuardActualizarUsuario, GuardRegistrarUsuario, GuardRolActualizar } from './guards/guards.guard';
import { RolMenuService } from './rol-menu/rol-menu.service';
import { PermisosRol, Permisos, MenuRol, RegistrarRolPermios } from './rol-menu/dto/rol-menu.dto';
import { GuardsMenulGuard, GuardsRolGuard } from './guards/guard_rol_permisos.guard';


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
    @ApiBody({ type: RegistrarRolPermios, description: 'Se hace el registro de los roles y se le atorgan permisos.' })
    @ApiOkResponse({ status: 201, description: 'Respuesta exitosa' })
    @UseGuards(GuardsRolGuard, GuardsMenulGuard)
    async rolRegistro(@Body() body: RegistrarRolPermios, @Res() res: Response) {
        try {
            await this.serviciRoloMenu.registrarRolPermisos(body)
            res.status(HttpStatus.CREATED).json({ mensaje: 'El rol se ha registrado exitosamente', status: RespuestaPeticion.OK })
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
    @UseGuards(GuardRolActualizar)
    async actualizarEstado(@Body() rol: RolEstado, @Res() res: Response) {
        try {
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
    @ApiOkResponse({ type: MenuRol })
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
    @ApiOkResponse({ type: Permisos })
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
    @ApiBody({ type: PermisosRol, description: 'Se enviara el id del rol que se le actualizara y los menus a cambiar.' })
    @ApiOkResponse({ description: 'Respuesta exitosa' })
    async registrarPermisos(@Body() permisos: PermisosRol, @Res() res: Response) {
        try {
            // .
            await this.serviciRoloMenu.actualizarPermisosRol(permisos)
            return res.status(HttpStatus.OK).json({ mensaje: Registro.EXITOSO_PERMISO_ROL, status: RespuestaPeticion.OK })
        } catch (error) {
            console.error(error.message);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ mensaje: MensajeAlerta.UPS, err: error.message });
        }
    }

    // crud de usuarios
    // Se registrara el usuario, rol asignado al usuario y proyectos
    @ApiTags('Usuarios')
    @Post('/registrar')
    @UseGuards(GuardRegistrarUsuario)
    @ApiBody({ type: DatosUsuario, description: 'Se hara el registro de ususarios.' })
    async crearUsuario(@Body() usuario: DatosUsuario, @Res() res: Response) {
        try {
            const datosUsuario = await this.sevicioUsuario.registrarUsuario(usuario);
            const htmlCuerpoRegistro = this.servicioEnvioCorreo.CuerpoRegistroUsuario(datosUsuario.nuevoNombreUsuario, datosUsuario.contrasenaUsuario, usuario);
            this.servicioEnvioCorreo.envio_correo(htmlCuerpoRegistro, usuario.correo);

            res.status(HttpStatus.OK).json({ mensaje: Registro.EXITOSO, status: RespuestaPeticion.OK });
        } catch (error) {
            console.error(error.message);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ mensaje: MensajeAlerta.UPS, err: error.message });
        }
    }

    @ApiTags('Usuarios')
    @Put('/actualizar')
    @UseGuards(GuardActualizarUsuario)
    @ApiBody({ type: DatosUsuario, description: 'Se hara la actualizacion de ususarios.' })
    async actualizarInformacionUsuario(@Body() usuario: DatosUsuario, @Res() res: Response) {
        try {
            await this.sevicioUsuario.actualizarUsuarios(usuario);
            res.status(HttpStatus.OK).json({ id: usuario.idUsuario, mensaje: "usuario actualizado exitosamente.", status: RespuestaPeticion.OK });
        } catch (error) {
            res.status(error.status).json({ err: MensajeAlerta.UPS, mensaje: error.message });
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


