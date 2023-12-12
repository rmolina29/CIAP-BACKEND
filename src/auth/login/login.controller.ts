import { Controller, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { LoginService } from './login.service';
import { RespuestaDataUsuario, DataLogin } from './interfaces_auth/usuario_auth_login.interface';

@Controller('/auth')
export class LoginController {
    constructor(private readonly servicioLogin: LoginService) {}

    private intentosLoginContador: number = 0;
    private lockedUntil: number = null;


    @Post('/login')
    async auth(@Body() usuario: DataLogin, @Res() res: Response): Promise<void> {
        try {
            let respuesta_auth: any;

            const data_auth_usuario: RespuestaDataUsuario[] = await this.servicioLogin.auth_login(usuario);
            const data_object_usuario: RespuestaDataUsuario = data_auth_usuario[0];

            // primero validamos si hay una cuenta y si la cuenta esta bloqueada 
            if (this.CuentaBloqueada(data_object_usuario)) {
                respuesta_auth = {
                    'response': {
                        login: false,
                        status: 'no',
                        mensaje: 'Cuenta bloqueada. Intenta nuevamente más tarde.'
                    }
                };
            }
            // sino el verificara si el usuario es correcto
            else if (this.loginExitoso(data_auth_usuario)) {
                this.intentosLoginContador = 0;
                this.lockedUntil = null;
                respuesta_auth = {
                    'data': data_object_usuario,
                    'response': { 'status': 'ok', 'mensaje': 'autorizado' }
                };
            }
            // sino el usuario es incorrecto tendremos en cuenta si el usuario existe o no, si existe se incrementara un intento fallido 
             else {
                const usuarioExiste = await this.servicioLogin.verificarUsuario(usuario);
                this.intentosLoginContador = usuarioExiste.length > 0 ? this.intentosLoginContador + 1 : 0;

                // aqui se valida si son mas de 3 intentos la cuenta se bloqueara automaticamente, cambiando su estado
                if (this.existeCuentaBloqueada()) {

                    await this.servicioLogin.cuentaUsuarioBloqueo(usuarioExiste[0].id);
                    respuesta_auth = {
                        'response': {
                            login: false,
                            status: 'no',
                            mensaje: 'Cuenta bloqueada. Intenta nuevamente más tarde.'
                        }
                    };
                } 
                // si el usuario no existe en la bd entonces retorna que no tiene autorizacion porque las credenciales estan incorrectas
                else {
                    respuesta_auth = {
                        'response': {
                            login: false,
                            status: 'no',
                            mensaje: 'No autorizado'
                        }
                    };
                }
            }

            res.json(respuesta_auth);

        } catch (error) {
            console.error('Error executing query:', error);
            res.status(500).json({ mensaje: 'Error executing query' });
        }
    }

    private CuentaBloqueada(dataUsuario: RespuestaDataUsuario): boolean {
        return dataUsuario && dataUsuario.estado_bloqueo === 1;
    }

    private loginExitoso(dataUsuarios: RespuestaDataUsuario[]): boolean {
        return dataUsuarios.length > 0;
    }

    private existeCuentaBloqueada(): boolean {
        return this.intentosLoginContador >= 3 && !this.lockedUntil;
    }



}
