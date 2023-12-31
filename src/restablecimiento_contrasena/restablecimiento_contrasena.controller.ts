import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { RestablecimientoContrasenaService } from './restablecimiento_contrasena.service';
import { ContrasenaUsuario, DatosToken, email, tokenValidacion } from './restablecimiento_contra.dto/verificacion_correo.dto';
import { Response } from 'express';
import { EnvioCorreosService } from 'src/envio_correos/envio_correos.service'; 
import { Email } from 'src/envio_correos/email.dto/email.dto'; 
import { ApiBody, ApiTags } from '@nestjs/swagger';


@ApiTags('Autenticacion')
@Controller('/auth')
export class RestablecimientoContrasenaController {


    constructor(private readonly serviceContrasena: RestablecimientoContrasenaService, private readonly servicioCorreo: EnvioCorreosService) { }
    @ApiBody({ type: email, description: 'Datos para verificar que el email sea correcto.' })
    @Post('/email_verificacion')
    async verificarEmail(@Body() mail: email, @Res() res: Response): Promise<void> {
        try {
            const obtener_email: Array<any> = await this.serviceContrasena.email_usuario_existe(mail);
            const datos_usuario = obtener_email[0]
            const usuario = obtener_email.length > 0 ?
                {
                    'response': { status: 'ok', mensaje: 'autorizado' },
                    'data': datos_usuario
                } :
                {
                    'response': {
                        status: 'no',
                        mensaje: 'email incorrecto, no autorizado'
                    }
                };

            // estado de la solicitud
            res.status(HttpStatus.OK).json(usuario);

        } catch (error) {
            console.error('Error executing query:', error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ mensaje: 'Error executing query', err: error.message });

        }
    }

    @Post('/olvidar_contrasena')
    @ApiBody({ type: Email, description: 'informacion que se usara la generacion dle Token.' })
    async olvidarContrasena(@Body() usuario_valido: Email, @Res() res: Response): Promise<void> {
        try {
            // esto me retorna el token de 4 digitos y la fecha de expiracion del token
            const datosToken: DatosToken = await this.serviceContrasena.generar_token(usuario_valido.id_usuario);
            //aqui se envia el correo electronico al usuario con el token generado
            let body = this.servicioCorreo.CuerpoTokenUsuario(datosToken, usuario_valido)

            await this.servicioCorreo.envio_correo(body, usuario_valido.email);

            res.status(HttpStatus.OK).json({ mensaje: 'Correo enviado con éxito' });

        } catch (error) {
            console.error('Error executing query:', error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ mensaje: 'Error executing query' });
        }
    }

    // en este endpoint lo que se hara es validar que el token no se encuentre en estado 
    @Post('/validaToken')
    @ApiBody({ type: tokenValidacion, description: 'Se hace la pertinente validacion del token segun su estado.' })
    async validarToken(@Body() body: tokenValidacion, @Res() res: Response) {
        try {
            let servicioToken = this.serviceContrasena
            // selecciona el ultimo token que genero el usuario y verifica si el token esta expirado o no
            const usuarioToken = await servicioToken.validarEsatdoToken(body);
            let response: any;

            if (usuarioToken[0].token === body.tokenUsuario && usuarioToken[0].estado === 0) {
                await servicioToken.estadoVerificado(body)
                response = { status: 'ok', mensaje: 'Autorizado' };
            } else if (usuarioToken[0].token != body.tokenUsuario) {
                response = { status: 'no', mensaje: 'el token es inválido' }

            } else if (usuarioToken[0].token === body.tokenUsuario && usuarioToken[0].estado === 1) {
                response = { status: 'no', mensaje: 'el token ya fue usado' };
            } else if (usuarioToken[0].token === body.tokenUsuario && usuarioToken[0].estado === 2) {
                response = { status: 'no', mensaje: 'token expirado' };
            }

            res.json(response);

        } catch (error) {
            console.error('Error executing query:', error);
            res.status(500).json({ mensaje: 'Error executing query' });
        }


    }

    //endpoint para validar el historial de la contraseña no sea igual 
    @Post('/cambio_contrasena')
    @ApiBody({ type: ContrasenaUsuario, description: 'Se procede a realizar el cambio de contraseña.' })
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
