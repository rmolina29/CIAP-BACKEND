import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Response } from 'express';
import { datosObjetoCuerpoHtml } from 'src/auth/login/dto_autenticacion/usuario_autenticacion.dto';
import { DatosToken } from 'src/restablecimiento_contrasena/restablecimiento_contra.dto/verificacion_correo.dto';
import { Email } from './email.dto/email.dto';
import { DatosUsuario } from 'src/crud_usuario/dtoCrudUsuario/crudUser.dto';


@Injectable()
export class EnvioCorreosService {
    private transportador: nodemailer.Transporter;

    constructor() {
        this.transportador = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            secure: false,
            auth: {
                type: "login",
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        })
    }
    // colocar privado
    async envio_correo(bodyString: string, correo: string) {

        let res: Response;
        // Lee el contenido HTML del archivo
        try {

            let body = {
                from: process.env.MAIL_USER, // Remitente
                to: correo, // Destinatario
                subject: "Nuevo mensaje para el usuario", // Asunto del correo
                html: `
                <!DOCTYPE html>
                <html>
                
                <head>
                    <meta charset='utf-8'>
                    <meta http-equiv='X-UA-Compatible' content='IE=edge'>
                    <title></title>
                    <meta name="viewport" content="width=device-width, user-scalable=no">
                </head>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,600;1,800;1,900&display=swap');
                
                    * {
                        font-family: 'Poppins', sans-serif
                    }
                
                    .card {
                        display: block;
                        margin: auto;
                        background: #fff;
                        border: 1px lightgray solid;
                        border-radius: 48px;
                        width: 450px;
                        height: auto;
                        padding-top: 55px;
                        padding-left: 35px;
                        padding-right: 35px;
                        padding-bottom: 20px
                    }
                
                    .logo {
                        width: 25%;
                        fill: rgb(165, 211, 83);
                        display: block;
                        margin: auto
                    }
                
                    .title {
                        font-weight: bold;
                        font-size: 18.6px;
                        text-align: center;
                        margin-top: 25px
                    }
                
                    .parrafo {
                        font-weight: 300;
                        font-size: 13.3px;
                        text-align: left
                    }
                
                    .token {
                        background-color: #B3DB7D;
                        display: block;
                        margin: auto;
                        width: 225px;
                        text-align: center;
                        padding: 13px;
                        border-radius: 110px;
                        color: #fff;
                        font-size: 18.5px;
                        font-weight: bold;
                        letter-spacing: 2px;
                    }
                
                    .note {
                        margin-top: 45px;
                        font-size: 13.3px;
                        font-weight: 600;
                        font-style: italic;
                        color: #343731
                    }
                
                    @media only screen and (max-width:600px) {
                        .card {
                            width: 275px;
                            padding-top: 30px;
                            padding-left: 25px;
                            padding-right: 25px
                        }
                
                        .title {
                            font-size: 15px;
                            margin-top: 21px
                        }
                
                        .parrafo {
                            font-size: 13px
                        }
                
                        .token {
                            width: 150px
                        }
                
                        .note {
                            font-size: 13px
                        }
                    }
                </style>
                
                
                <body>
                   ${bodyString}
                </body>
                
                </html>`,

            };

            this.transportador.sendMail(body);

        } catch (error) {
            console.error('Error al enviar correo:', error);
            res.status(500).json({ mensaje: 'Hemos tenido un problema al enviar el correo' });
        }

    }

    // Este cuerpo es dedicado para el envio de la informacion de la cuenta bloqueada
    cuerpoHtmlCuentaBloqueada(datosUsuario: any, datosObjetoCuerpoHtml: datosObjetoCuerpoHtml): string {
        return `
            <div class="card">
                <svg class="logo" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                    preserveAspectRatio="xMidYMid meet" version="1.0" viewBox="0.0 0.0 368.9 500.0" zoomAndPan="magnify"
                    style="fill: rgb(179, 219, 125);" original_string_length="898">
                    <g id="__id229_she4gcnkak">
                        <path
                            d="M350.5,202.7h-25.5v-62C325.1,63.1,262,0,184.4,0S43.7,63.1,43.7,140.7v62H18.3C8.2,202.7,0,210.9,0,221v260.8 C0,491.8,8.2,500,18.3,500h332.3c10.1,0,18.3-8.2,18.3-18.3V221C368.8,210.9,360.6,202.7,350.5,202.7z M80.3,140.7 c0-57.4,46.7-104.1,104.1-104.1s104.1,46.7,104.1,104.1v62H80.3V140.7z M202.7,364.5v48.1c0,10.1-8.2,18.3-18.3,18.3 s-18.3-8.2-18.3-18.3v-48.1c-12.6-6.6-21.2-19.8-21.2-34.9c0-21.8,17.7-39.4,39.4-39.4c21.8,0,39.4,17.7,39.4,39.4 C223.9,344.7,215.3,357.9,202.7,364.5z"
                            style="fill: inherit;" />
                    </g>
                </svg>
                <h2 class="title">Bloqueo de cuenta</h2>
                <h4 class="parrafo">Buen día, ${datosUsuario.nombres} ${datosUsuario.apellidos}</h4>
                <p class="parrafo">
                    Se le informa que se ha bloqueado su cuenta después de (${datosObjetoCuerpoHtml.cantidadLoginValidos}) intentos fallidos de acceso incorrecto. La
                    cuenta permanecerá bloqueada por ${datosObjetoCuerpoHtml.tiempoRelogin} minutos a partir de la recepción de este correo.
                </p>
                <p class="parrafo" style="text-align: center;">La cuenta se desbloqueará el<span style="font-weight: bold;">
                    ${datosObjetoCuerpoHtml.fechaBloqueo}</span></p>
                <p class="note">
                    Este mensaje de correo se le ha enviado de forma automática. Por favor, no intente enviar correos a la
                    dirección de este mensaje.
                </p>
            </div>
     `
    }


    CuerpoTokenUsuario(datosToken: DatosToken, usuario_valido: Email) {
        return `
        <div class="card">
        <svg class="logo" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
            preserveAspectRatio="xMidYMid meet" version="1.0" viewBox="1.0 1.0 510.0 510.0" zoomAndPan="magnify"
            style="fill: rgb(165, 211, 83);" original_string_length="1621">
            <g>
                <g>
                    <g id="__id276_she4gcnkak">
                        <path d="M330.246 160.541L351.46 139.327 326.711 135.792z" style="fill: inherit;" />
                        <path d="M160.54 372.673L185.289 376.208 181.754 351.459z" style="fill: inherit;" />
                        <path
                            d="M256,1C115.049,1,1,115.068,1,256c0,140.951,114.068,255,255,255c140.951,0,255-114.068,255-255 C511,115.049,396.932,1,256,1z M200.846,408.735L126.6,398.129c-12.208-1.744-17.218-16.724-8.485-25.456l21.742-21.742 C91.67,292.068,95.028,204.84,149.934,149.934c26.247-26.247,61.101-41.774,98.139-43.723 c8.289-0.428,15.333,5.919,15.768,14.191c0.435,8.273-5.919,15.332-14.191,15.768c-29.625,1.558-57.504,13.979-78.502,34.977 c-43.197,43.197-46.51,111.403-9.945,158.439l20.552-20.552c8.717-8.721,23.709-3.74,25.456,8.485l10.606,74.246 C219.221,401.61,210.796,410.149,200.846,408.735z M362.066,362.066c-26.247,26.247-61.101,41.774-98.139,43.723 c-8.355,0.425-15.336-5.986-15.768-14.191c-0.435-8.273,5.919-15.332,14.191-15.768c29.625-1.558,57.504-13.979,78.502-34.977 c43.197-43.197,46.51-111.403,9.945-158.439l-20.552,20.552c-8.725,8.728-23.711,3.729-25.456-8.485l-10.606-74.246 c-1.409-9.874,7.048-18.373,16.971-16.971l74.246,10.606c12.208,1.744,17.218,16.724,8.485,25.456l-21.742,21.742 C420.33,219.932,416.972,307.16,362.066,362.066z"
                            style="fill: inherit;" />
                    </g>
                </g>
            </g>
        </svg>
        <h2 class="title">Restablecimiento de contraseña</h2>
        <h4 class="parrafo">Buen día, ${usuario_valido.nombres} ${usuario_valido.apellidos}</h4>
        <p class="parrafo">
            Reciba un cordial saludo.

            A continuación, le enviamos sus credenciales de acceso a la plataforma CIAP:
        </p>
        <div class="token">
            ${datosToken.clave}
        </div>
        <p class="parrafo" style="text-align: center;">El código expira el<span style="font-weight: bold;"> 2023-12-15
            ${datosToken.fechaExpiracion}</span></p>
        <p class="note">
            Este mensaje de correo se le ha enviado de forma automática. Por favor, no intente enviar correos a la
            dirección de este mensaje.
        </p>
    </div>
     `
    }

    CuerpoRegistroUsuario(nombreUsuario: string, contrasena: string, datosUsuario: DatosUsuario) {
        return `
        <div class="card">
        <h2 class="title">Credenciales de acceso - CIAP</h2>
        <h4 class="parrafo">Buen día, ${datosUsuario.nombres} ${datosUsuario.apellidos}</h4>
        <p class="parrafo">
            Reciba un cordial saludo.
            <br>
            A continuación, le enviamos sus credenciales de acceso a la plataforma CIAP:
        </p>
        <div class="token">
            Usuario: ${nombreUsuario}
        </div>
        <br>
        <div class="token">
            Contraseña: ${contrasena}
        </div>
        <br>
        <p class="parrafo">
            Al ingresar al sistema, le solicitaremos el cambio de contraseña. Debe tener en cuenta las políticas de
            seguridad que se le indicarán.
            <br><br>
            Para acceder a la plataforma CIAP, haga clic <a href="http://35.88.165.47:8080/#/auth/login"
                style="background: #b3db7d; padding: 5px; border-radius: 12px; color: white; text-decoration: none;">aquí</a>
        </p>
        <p class="note">
            Este mensaje de correo se le ha enviado de forma automática. Por favor, no intente enviar correos a la
            dirección de este mensaje.
        </p>
    </div>
     `
    }
}
