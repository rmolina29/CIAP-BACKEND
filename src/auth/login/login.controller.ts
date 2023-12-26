import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { LoginService } from './login.service';
import { DataLogin, RespuestaDataUsuario, datosObjetoCuerpoHtml } from './dto_autenticacion/usuario_autenticacion.dto';
import * as moment from 'moment-timezone';
import { MensajeAlerta, TipoEstado } from 'src/mensajes_usuario/mensajes-usuario.enum';
import { EnvioCorreosService } from 'src/restablecimiento_contrasena/envio_correos/envio_correos.service';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Autenticacion')

@Controller('/auth')
export class LoginController {
    constructor(private readonly servicioLogin: LoginService, private readonly servicioEnvioCorreo: EnvioCorreosService) { }


    private intentosLogin: number = 0;
    private bloqueoCuenta: number = null;

    @Post('/login')
    @ApiBody({ type: DataLogin, description: 'Datos de inicio de sesión' })
    @ApiResponse({ status: 200, description: 'Autenticación exitosa' })
    @ApiResponse({ status: 401, description: 'No autorizado.' })
    @ApiResponse({ status: 400, description: 'Error en la solicitud' })
    async auth(@Body() usuario: DataLogin, @Res() res: Response): Promise<void> {
        try {
            const tiempoRelogin = parseInt(await this.servicioLogin.tiempoRelogin());
            const respuestaAutenticacion = await this.controlDeAutenticacion(usuario, tiempoRelogin);
            res.json(respuestaAutenticacion);

        } catch (error) {
            console.error({ mensaje: MensajeAlerta.ERROR, err: error.message, status: HttpStatus.INTERNAL_SERVER_ERROR });
            throw new Error(`${MensajeAlerta.ERROR}, ${error.message}`);
        }
    }

    private async controlDeAutenticacion(usuario: DataLogin, tiempoRelogin: number): Promise<any> {

        const data_auth_usuario: RespuestaDataUsuario[] = await this.servicioLogin.auth_login(usuario);

        if (this.loginExitoso(data_auth_usuario)) {
            // si el usuario existe le asigna la infromacion que contiene 
            const datosObjetoUsuario: RespuestaDataUsuario = data_auth_usuario[0];
            return await this.manejoExitosoAutenticacion(datosObjetoUsuario, tiempoRelogin);
        } else {
            return await this.manejoAutenticacionFallida(usuario, tiempoRelogin);
        }
    }

    private async manejoExitosoAutenticacion(datosObjetoUsuario: RespuestaDataUsuario, tiempoRelogin: number): Promise<any> {

        if (datosObjetoUsuario.bloqueo_cuenta_usuario === TipoEstado.INACTIVO) {
            return {
                response: {
                    login: false,
                    status: 'bl',
                    mensaje: 'El usuario ha sido desactivado.'
                }
            }
        }
        else if (datosObjetoUsuario.tipo_contrasena === TipoEstado.CONTRASENA_PRIMERA_VEZ) {
            return {
                response: {
                    login: false,
                    status: 'pr',
                    mensaje: 'Debe cambiar contraseña, por primer ingreso a la plataforma.'
                },
                data: { id_usuario: datosObjetoUsuario.id_ua },
            }
        }

        else if (await this.usuarioContrasenaCaducada(datosObjetoUsuario.fechaContrasena)) {
            return {
                response: {
                    login: false,
                    status: 'ca',
                    mensaje: 'El usuario ha superado el tiempo de caducidad de contraseña.',
                },
                data: { id_usuario: datosObjetoUsuario.id_ua },
            };

        }
        else if (this.cuentaBloqueada(datosObjetoUsuario)) {
            return {
                response: {
                    login: false,
                    status: 'bl',
                    mensaje: `Su cuenta ha sido bloqueada. Intente ingresar nuevamente después de transcurridos ${tiempoRelogin} minutos.`,
                },
            };
        } else {
            this.reseteContadorFallidos();
            return {
                data: datosObjetoUsuario,
                permisos: await this.servicioLogin.permisoRol(datosObjetoUsuario.id_rol_usuario),
                response: { status: 'ok', mensaje: 'autorizado' },
            };
        }
    }

    private async manejoAutenticacionFallida(usuario: DataLogin, tiempoRelogin: number): Promise<any> {

        const usuarioExiste = await this.servicioLogin.verificarUsuario(usuario);
        this.intentosLogin = usuarioExiste.length > 0 ? this.intentosLogin + 1 : 0;
        let cuentaBloqueada = await this.existeCuentaBloqueada()

        if (!cuentaBloqueada) {
            return {
                response: {
                    login: false,
                    status: 'no',
                    mensaje: 'No autorizado',
                }

            }
        }

        let datosUsuario = usuarioExiste[0]
        let idUsuario = datosUsuario.id;

        // se envia el correo a la persona señalando que su cuenta ha sido bloqueada
        if (await this.servicioLogin.primerBloqueoUsuario(idUsuario)) {
            // se hace el bloqueo del usuario
            let usuarioBloqueo = await this.servicioLogin.cuentaUsuarioBloqueo(idUsuario)
            let usuarioParametrizacion = await this.servicioLogin.usuarioParametrizacionData()
            let cantidadLoginValidos = usuarioParametrizacion.data.cantidad_login_valido;

            let datosObjetoCuerpoHtml: datosObjetoCuerpoHtml = {
                tiempoRelogin,
                fechaBloqueo: usuarioBloqueo.fechaBloqueo,
                cantidadLoginValidos
            }

            // se obtiene el cuerpo que se le enviara al correo pór medio del servicio
            let bodyCorreo = this.servicioEnvioCorreo.cuerpoHtmlCuentaBloqueada(datosUsuario, datosObjetoCuerpoHtml)
            this.servicioEnvioCorreo.envio_correo(bodyCorreo, datosUsuario.correo);

        }

        return {
            response: {
                login: false,
                status: 'bl',
                mensaje: `Su cuenta ha sido bloqueada. Intente ingresar nuevamente después de transcurridos ${tiempoRelogin} minutos.`,
            },
        }
    }




    // se reinicia cuando el usuario entre exitosamente
    private reseteContadorFallidos(): void {
        this.intentosLogin = 0;
        this.bloqueoCuenta = null;
    }


    // esta funcion me mostrata los meses que se han pasado a partir de que se creo la ultima contraseña del usuario
    fechaActual() {
        var fechaActualUTC = moment().utc();
        var fechaActualColombia = fechaActualUTC.tz("America/Bogota");

        return fechaActualColombia
    }

    // En este metodo se utilizara 
    private async usuarioContrasenaCaducada(_fechaContrasena: any): Promise<boolean> {
        let usuarioParametrizacion = await this.servicioLogin.usuarioParametrizacionData()
        let tiempoContrasena = usuarioParametrizacion.data.tiempo_contrasena;

        const fechaActual = this.fechaActual()
        const mesCaducidadContrasena = moment(_fechaContrasena).add(tiempoContrasena, 'month');

        return mesCaducidadContrasena < fechaActual;
    }

    // se hace la verificacion de que si el usuario esta bloqueado 
    private cuentaBloqueada(dataUsuario: RespuestaDataUsuario): boolean {
        return dataUsuario && dataUsuario.estado_bloqueo === 1;
    }

    // aqui verifiamos el login exitoso del usuario por medio de las credenciales del (correo o usuario) y de la contraseña
    private loginExitoso(dataUsuarios: RespuestaDataUsuario[]): boolean {
        return dataUsuarios.length > 0;
    }

    // aqui a traves de la fecha del bloqueo verificamos si el usuario aun sigue con la cuenta bloqueada o no
    private async existeCuentaBloqueada(): Promise<boolean> {
        let usuarioParametrizacion = await this.servicioLogin.usuarioParametrizacionData()
        let cantidadLoginValidos = usuarioParametrizacion.data.cantidad_login_valido;
        return this.intentosLogin >= cantidadLoginValidos && !this.bloqueoCuenta;
    }

}
