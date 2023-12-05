import { Controller, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { LoginService } from './login.service';
import { Usuario, RespuestaDataUsuario } from './interfaces_auth/usuario_auth_login.interface';

@Controller('/auth/login')
export class LoginController {
    constructor(private readonly serviceDatabase: LoginService) {

    }

    @Post()
    async auth(@Body() usuario: Usuario, @Res() res: Response): Promise<void> {

        try {
            const data_auth_usuario: Array<RespuestaDataUsuario> = await this.serviceDatabase.auth_login(usuario);

            const respuesta_auth = data_auth_usuario.length > 0

                ? { 'usuario': data_auth_usuario,'respuesta': { 'status': 200, 'mensaje': 'autorizado' } }
                : {
                    'usuario': [{
                        login: false,
                        status: 401,
                        mensaje: 'no autorizado'
                    }]
                };

            res.json(respuesta_auth);

        } catch (error) {
            console.error('Error executing query:', error);
            res.status(500).json({ mensaje: 'Error executing query' });
        }
    }
}
