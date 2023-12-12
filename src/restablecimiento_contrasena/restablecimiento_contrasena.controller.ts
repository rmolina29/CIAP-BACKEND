import { Body, Controller, Get, HttpStatus, Post, Res } from '@nestjs/common';
import { RestablecimientoContrasenaService } from './restablecimiento_contrasena.service';
import { ContrasenaUsuario, DatosToken, email, tokenValidacion } from './restablecimiento_contra.interface/verificacion_correo.interface';
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
            const datosToken: DatosToken = await this.serviceContrasena.generar_token(usuario_valido.id_usuario);
            //aqui se envia el correo electronico al usuario con el token generado
            await this.servicioCorreo.envio_correo(usuario_valido, datosToken);

            res.status(HttpStatus.OK).json({ mensaje: 'Correo enviado con éxito' });

        } catch (error) {
            console.error('Error executing query:', error);
            res.status(500).json({ mensaje: 'Error executing query' });
        }
    }

    // en este endpoint lo que se hara es validar que el token no se encuentre en estado 
    @Post('/validaToken')
    async validarToken(@Body() body: tokenValidacion, @Res() res: Response) {
        try {
            let servicioToken = this.serviceContrasena
            // selecciona el ultimo token que genero el usuario y verifica si el token esta expirado o no
            const usuarioToken = await servicioToken.validarEsatdoToken(body);

            //TENIENDO EN CUENTA QUE SE ENVIA EL ID DEL USUARIO 
            const response = usuarioToken.length === 0
                // si no se recibe informacion del query el token es invalido
                ? { status: 'no', mensaje: 'el token es inválido' }
                //sino se revisa el estado en el que lleva el token 
                : usuarioToken[0].estado === 2
                    // si se encuentra en 2 esta en estado de expiracion
                    ? { status: 'no', mensaje: 'token expirado' }
                    // sino tiene autorizacion al cambio de contraseña
                    :
                    (
                        await servicioToken.estadoVerificado(body.idUsuario),
                        { status: 'ok', mensaje: 'Autorizado' }
                    )


            res.json(response);

        } catch (error) {
            console.error('Error executing query:', error);
            res.status(500).json({ mensaje: 'Error executing query' });
        }


    }

    //endpoint para validar el historial de la contraseña no sea igual 
    @Post('/cambio_contrasena')
    async cambioContrasena(@Body() requestContra: ContrasenaUsuario, @Res() res: Response) {
        try {

            //logica de cambio de contrasena

            // 1) validamos que la contraseña no se encuentre en su historial de registradas, si es asi le devolveremos que debe asignar una contraseña diferente 
            //2) Se actualizara el estado de la ultima contraseña del estado 1. Activa al estado 2. Desactivada 
            //3) ya validada la contraseña se hara la insercion de la nueva contraseña con el id del usuario y la nueva contraseña

            const contrasenaExiste = await this.serviceContrasena.HistorialContrasenaExiste(requestContra)

            const response = contrasenaExiste

                ? { status: 'no', mensaje: 'La contraseña ya se encuentra registrada. Por favor, elija una contraseña diferente.' }
                : (
                    await this.serviceContrasena.actualizacionEstadoContasena(requestContra.idUsuario),
                    await this.serviceContrasena.registroNuevaContrasena(requestContra),
                    { status: 'ok', mensaje: 'Contraseña registrada exitosamente.' }
                );


            res.json(response);

        } catch (error) {
            console.error('Error executing query:', error);
            res.status(500).json({ mensaje: 'Error executing query' });
        }
    }

}
