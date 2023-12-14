import { Controller, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { LoginService } from './login.service';
import { RespuestaDataUsuario, DataLogin } from './interfaces_auth/usuario_auth_login.interface';
import * as moment from 'moment-timezone';

@Controller('/auth')
export class LoginController {
    constructor(private readonly servicioLogin: LoginService) { }

    private intentosLoginContador: number = 0;
    private lockedUntil: number = null;


    @Post('/login')
    async auth(@Body() usuario: DataLogin, @Res() res: Response): Promise<void> {
        try {
            let respuesta_auth: any;

            const data_auth_usuario: RespuestaDataUsuario[] = await this.servicioLogin.auth_login(usuario);
            const data_object_usuario: RespuestaDataUsuario = data_auth_usuario[0];

            if (this.loginExitoso(data_auth_usuario)) {
                if (await this.usuarioContrasenaCaducada(data_object_usuario.fechaContrasena)) {
                    respuesta_auth = {
                        'response': {
                            login: false,
                            status: 'ca',
                            idUsuario:data_object_usuario.id_ua,
                            mensaje: 'El usuario ha pasado el tiempo de caducidad de contraseña.'
                        }
                    };
                }

                // primero validamos si hay una cuenta y si la cuenta esta bloqueada 
                else if (this.cuentaBloqueada(data_object_usuario)) {
                    respuesta_auth = {
                        'response': {
                            login: false,
                            status: 'bl',
                            mensaje: 'Cuenta bloqueada. Intenta nuevamente más tarde.'
                        }
                    };
                }
                // sino el verificara si el usuario es correcto
                else {
                    this.intentosLoginContador = 0;
                    this.lockedUntil = null;
                    respuesta_auth = {
                        'data': data_object_usuario,
                        'response': { 'status': 'ok', 'mensaje': 'autorizado' }
                    };
                }


                // si el usuario no existe en la bd entonces retorna que no tiene autorizacion porque las credenciales estan incorrectas
            } else {

                // sino el usuario es incorrecto tendremos en cuenta si el usuario existe o no, si existe se incrementara un intento fallido 

                const usuarioExiste = await this.servicioLogin.verificarUsuario(usuario);
                this.intentosLoginContador = usuarioExiste.length > 0 ? this.intentosLoginContador + 1 : 0;

                // aqui se valida si son mas de 3 intentos la cuenta se bloqueara automaticamente, cambiando su estado
                var cuentaBloqueada = await this.existeCuentaBloqueada()

                if (cuentaBloqueada) {
                    await this.servicioLogin.cuentaUsuarioBloqueo(usuarioExiste[0].id);
                    respuesta_auth = {
                        'response': {
                            login: false,
                            status: 'bl',
                            mensaje: 'Cuenta bloqueada. Intenta nuevamente más tarde.'
                        }
                    };
                } else {
                    {
                        respuesta_auth = {
                            'response': {
                                login: false,
                                status: 'no',
                                mensaje: 'No autorizado'
                            }
                        };
                    }
                }

            }

            res.json(respuesta_auth);

        } catch (error) {
            console.error('Error executing query:', error);
            res.status(500).json({ mensaje: 'Error executing query' });
        }
    }


    // esta funcion me mostrata los meses que se han pasado a partir de que se creo la ultima contraseña del usuario
    fechaActual() {
        var fechaActualUTC = moment().utc();
        var fechaActualColombia = fechaActualUTC.tz("America/Bogota");

        return fechaActualColombia
    }

    // teniendo en cuenta que la caducidad es por meses
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
