import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { RestablecimientoContrasenaService } from './restablecimiento_contrasena.service';
import { email, tokenUsuario } from './restablecimiento_contra.interface/verificacion_correo.interface';
import { Response } from 'express';
import { EnvioCorreosService } from './envio_correos/envio_correos.service'
import { Email } from './envio_correos/email.interface/email.interface';

@Controller('/auth')
export class RestablecimientoContrasenaController {


    constructor(private readonly serviceContrasena: RestablecimientoContrasenaService, private readonly servicioCorreo: EnvioCorreosService) { }

    @Post('/email_verificacion')
    async verificarEmail(@Body() mail: email, @Res() res: Response): Promise<void> {
        try {
            const obtener_email: Array<any> = await this.serviceContrasena.email_usuario_existe(mail);
            const datos_usuario = obtener_email[0]
            const usuario = obtener_email.length > 0

                ? {
                    'response': { status: 'ok', mensaje: 'autorizado' },
                    'data': datos_usuario
                }
                : {
                    'response': {
                        status: 'no',
                        mensaje: 'email incorrecto, no autorizado'
                    }
                };

            // estado de la solicitud
            res.status(200).json(usuario);

        } catch (error) {
            console.error('Error executing query:', error);
            res.status(500).json({ mensaje: 'Error executing query' });

        }
    }

    @Post('/olvidar_contrasena')
    async olvidarContrasena(@Body() usuario_valido: Email, @Res() res: Response): Promise<void> {
        try {
            // esto me retorna el token de 4 digitos y la fecha de expiracion del token
            const datosToken:Object = await this.serviceContrasena.generar_token(usuario_valido.id_usuario);
            //aqui se envia el correo electronico al usuario con el token generado
            const enviar_correo = await this.servicioCorreo.envio_correo(usuario_valido,datosToken);

            res.json(enviar_correo);

        } catch (error) {
            console.error('Error executing query:', error);
            res.status(500).json({ mensaje: 'Error executing query' });
        }
    }

    // en este endpoint lo que se hara es validar que el token no se encuentre en estado 
    @Get('/validaToken')
    async validarToken(@Body() body: any, @Res() res: Response) {
        try {
            let servicioToken = this.serviceContrasena
            // se obtiene la id con idUsuario y se va al servicio para consultar el ultimo token del usuario
            let idUsuario = body.idUsuario
            // selecciona el ultimo token que genero el usuario y verifica si el token esta expirado o no
            const usuarioToken = await servicioToken.validarEsatdoToken(idUsuario);
            
            const estadoToken = usuarioToken[0].estado
            
            // se valida 
            const verificacion = estadoToken == 0 ?
                { status: 'no', mensaje: 'token expirado' } :
                this.serviceContrasena.estadoVerificado(idUsuario)

            res.json(verificacion);

        } catch (error) {
            console.error('Error executing query:', error);
            res.status(500).json({ mensaje: 'Error executing query' });
        }


    }

}
