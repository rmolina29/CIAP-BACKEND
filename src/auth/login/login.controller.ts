import { Controller, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { LoginService } from './login.service';
import { RespuestaDataUsuario, DataLogin } from './interfaces_auth/usuario_auth_login.interface';
import * as moment from 'moment-timezone';

@Controller('/auth')
export class LoginController {
    constructor(private readonly servicioLogin: LoginService) {

    }

    private intentosLoginContador: number = 0;
    private lockedUntil: number = null;


    @Post('/login')
    async auth(@Body() usuario: DataLogin, @Res() res: Response): Promise<void> {
        try {
            const tiempoRelogin = parseInt(await this.servicioLogin.tiempoRelogin()) ;
            const respuesta_auth = await this.handleAuthentication(usuario, tiempoRelogin);

            res.json(respuesta_auth);

        } catch (error) {
            console.error('Error executing query:', error);
            res.status(500).json({ mensaje: 'Error executing query' });
        }
    }

    private async handleAuthentication(usuario: DataLogin, tiempoRelogin: number): Promise<any> {

        const data_auth_usuario: RespuestaDataUsuario[] = await this.servicioLogin.auth_login(usuario);
        const data_object_usuario: RespuestaDataUsuario = data_auth_usuario[0];

        if (this.loginExitoso(data_auth_usuario)) {
            return await this.handleSuccessfulLogin(data_object_usuario, tiempoRelogin);
        } else {
            console.log('bloque bloqueo');
            
            return await this.handleFailedLogin(usuario, tiempoRelogin);
        }
    }

    private async handleSuccessfulLogin(data_object_usuario: RespuestaDataUsuario, tiempoRelogin: number): Promise<any> {
        
        if (await this.usuarioContrasenaCaducada(data_object_usuario.fechaContrasena)) {
            return {
                response: {
                    login: false,
                    status: 'ca',
                    mensaje: 'El usuario ha superado el tiempo de caducidad de contraseña.',
                },
                data: { id_usuario: data_object_usuario.id_ua },
            };

        } 
      
        
        else if (this.cuentaBloqueada(data_object_usuario)) {
            return {
                response: {
                    login: false,
                    status: 'bl',
                    mensaje: `Su cuenta ha sido bloqueada. Intente ingresar nuevamente después de transcurridos ${tiempoRelogin} minutos.`,
                },
            };
        } else {
            this.resetLoginAttempts();
            return {
                data: data_object_usuario,
                response: { status: 'ok', mensaje: 'autorizado' },
            };
        }
    }

    private async handleFailedLogin(usuario: DataLogin, tiempoRelogin: number): Promise<any> {

        const usuarioExiste = await this.servicioLogin.verificarUsuario(usuario);
        this.intentosLoginContador = usuarioExiste.length > 0 ? this.intentosLoginContador + 1 : 0;
        var cuentaBloqueada = await this.existeCuentaBloqueada()

        if (cuentaBloqueada) {
            await this.servicioLogin.cuentaUsuarioBloqueo(usuarioExiste[0].id)
            return {
                response: {
                    login: false,
                    status: 'bl',
                    mensaje:`Su cuenta ha sido bloqueada. Intente ingresar nuevamente después de transcurridos ${tiempoRelogin} minutos.`,
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

    private resetLoginAttempts(): void {
        this.intentosLoginContador = 0;
        this.lockedUntil = null;
    }

    private incrementLoginAttempts(usuarioExiste: any[]): void {
        this.intentosLoginContador = usuarioExiste?.length > 0 ? this.intentosLoginContador + 1 : 0;
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

    private cuentaBloqueada(dataUsuario: RespuestaDataUsuario): boolean {
        return dataUsuario && dataUsuario.estado_bloqueo === 1;
    }

    private loginExitoso(dataUsuarios: RespuestaDataUsuario[]): boolean {
        return dataUsuarios.length > 0;
    }

    private async existeCuentaBloqueada(): Promise<boolean> {
        let usuarioParametrizacion = await this.servicioLogin.usuarioParametrizacionData()
        let cantidadLoginValidos = usuarioParametrizacion.data.cantidad_login_valido;
        return this.intentosLoginContador >= cantidadLoginValidos && !this.lockedUntil;
    }

}
