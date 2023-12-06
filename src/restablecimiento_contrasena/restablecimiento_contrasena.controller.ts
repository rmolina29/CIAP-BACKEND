import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { RestablecimientoContrasenaService } from './restablecimiento_contrasena.service';
import { Verificacion_email } from './restablecimiento_contra.interface.ts/verificacion_correo.interface';
import { Response } from 'express';


@Controller('auth/email_verificacion')
export class RestablecimientoContrasenaController {


    constructor(private readonly serviceContrasena: RestablecimientoContrasenaService) {}

    @Post()
    async verificar_email(@Body() mail: Verificacion_email, @Res() res: Response): Promise<void> {
        try {
            const data: Array<any> = await this.serviceContrasena.email_usuario_existe(mail);

            const email = data.length > 0

                ? { 'verificacion_email': [{ permiso: true, status: 200, mensaje: 'autorizado' }] }
                : {
                    'verificacion_email': [{
                        permiso: false,
                        status: 403,
                        mensaje: 'email incorrecto, no autorizado'
                    }]
                };

            // estado de la solicitud
            const estado = email.verificacion_email[0].status;
            
            res.status(estado).json(email);
        } catch (error) {
            console.error('Error executing query:', error);
            res.status(500).json({ mensaje: 'Error executing query' });

        }
    }

}
