import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { LoginService } from './login.service';
import { DataLogin, RespuestaDataUsuario } from './dto_autenticacion/usuario_autenticacion.dto';
import * as moment from 'moment-timezone';
import { TipoEstado } from 'src/mensjaes_usuario/mensajes-usuario.enum';

@Controller('/auth')
export class LoginController {
    constructor(private readonly servicioLogin: LoginService) { }

    private intentosLogin: number = 0;
    private bloqueoCuenta: number = null;


    @Post('/login')
    async auth(@Body() usuario: DataLogin, @Res() res: Response): Promise<void> {
        try {
            const tiempoRelogin = parseInt(await this.servicioLogin.tiempoRelogin());
            const respuestaAutenticacion = await this.controlDeAutenticacion(usuario, tiempoRelogin);

            res.json(respuestaAutenticacion);

        } catch (error) {
            console.error('Error executing query:', error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ mensaje: 'Error executing query' });
        }
    }

    private async controlDeAutenticacion(usuario: DataLogin, tiempoRelogin: number): Promise<any> {

        const data_auth_usuario: RespuestaDataUsuario[] = await this.servicioLogin.auth_login(usuario);
        const datosObjetoUsuario: RespuestaDataUsuario = data_auth_usuario[0];

        if (this.loginExitoso(data_auth_usuario)) {
            return await this.manejoExitosoAutenticacion(datosObjetoUsuario, tiempoRelogin);
        } else {
            return await this.manejoAutenticacionFallida(usuario, tiempoRelogin);
        }
    }

    private async manejoExitosoAutenticacion(datosObjetoUsuario: RespuestaDataUsuario, tiempoRelogin: number): Promise<any> {
        console.log(datosObjetoUsuario.bloqueo_cuenta_usuario);
        
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
                response: { status: 'ok', mensaje: 'autorizado' },
            };
        }
    }

    private async manejoAutenticacionFallida(usuario: DataLogin, tiempoRelogin: number): Promise<any> {

        const usuarioExiste = await this.servicioLogin.verificarUsuario(usuario);
        this.intentosLogin = usuarioExiste.length > 0 ? this.intentosLogin + 1 : 0;
        var cuentaBloqueada = await this.existeCuentaBloqueada()

        if (cuentaBloqueada) {
            await this.servicioLogin.cuentaUsuarioBloqueo(usuarioExiste[0].id)
            return {
                response: {
                    login: false,
                    status: 'bl',
                    mensaje: `Su cuenta ha sido bloqueada. Intente ingresar nuevamente después de transcurridos ${tiempoRelogin} minutos.`,
                },
            };
        } else {
            return {
                response: {
                    login: false,
                    status: 'no',
                    mensaje: 'No autorizado',
                },
            };
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
