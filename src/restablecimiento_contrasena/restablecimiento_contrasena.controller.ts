import { Body, Controller, Get, Patch, Post, Res } from '@nestjs/common';
import { RestablecimientoContrasenaService } from './restablecimiento_contrasena.service';
import { email } from './restablecimiento_contra.interface.ts/verificacion_correo.interface';
import { Response } from 'express';


@Controller('/auth')
export class RestablecimientoContrasenaController {


    constructor(private readonly serviceContrasena: RestablecimientoContrasenaService) {}

    @Post('/email_verificacion')
    async verificarEmail(@Body() mail: email, @Res() res: Response): Promise<void> {
        try {
            const obtener_email: Array<any> = await this.serviceContrasena.email_usuario_existe(mail);

            const usuario = obtener_email.length > 0

                ? { 'verificacion_email': [{ permiso: true, status: 200, mensaje: 'autorizado' }] }
                : {
                    'verificacion_email': [{
                        permiso: false,
                        status: 403,
                        mensaje: 'email incorrecto, no autorizado'
                    }]
                };

            // estado de la solicitud
            const estado = usuario.verificacion_email[0].status;
            
            res.status(estado).json(usuario);
        } catch (error) {
            console.error('Error executing query:', error);
            res.status(500).json({ mensaje: 'Error executing query' });

        }
    }

    @Post('/olvidar_contrasena')
    async tokenVerificacion(@Body() mail:email, @Res() res:Response):Promise<void>{
        try {

            
        } catch (error) {
            console.error('Error executing query:', error);
            res.status(500).json({ mensaje: 'Error executing query' });
        }
    }

}
