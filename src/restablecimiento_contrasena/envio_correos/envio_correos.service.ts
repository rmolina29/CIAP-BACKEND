import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Response } from 'express';
import { DatosToken } from '../restablecimiento_contra.dto/verificacion_correo.dto';
import { Email } from './email.dto/email.dto';

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
    async envio_correo(usuarioEnvio: Email, datosToken: DatosToken) {

        let res: Response;
        // Lee el contenido HTML del archivo
        try {

            let body = {
                from: process.env.MAIL_USER, // Remitente
                to: usuarioEnvio.email, // Destinatario
                subject: "Nuevo mensaje para el usuario", // Asunto del correo
                html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="utf-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    <title>Template Mail CIAP</title>
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet"
                        integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossorigin="anonymous" />
                    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.min.css" />
                </head>
                
                <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js"
                    integrity="sha384-I7E8VVD/ismYTF4hNIPjVp/Zjvgyol6VFvRkX/vR+Vc4jQkC+hVqc2pM8ODewa9r"
                    crossorigin="anonymous"></script>
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.min.js"
                    integrity="sha384-BBtl+eGJRgqQAUMxJ7pMwbEyER4l1g+O15P+16Ep7Q9Q+zqX6gSbd85u4mG4QzX+"
                    crossorigin="anonymous"></script>
                
                <style>
                    @import url("https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100;0,9..40,200;0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900;0,9..40,1000;1,9..40,100;1,9..40,200;1,9..40,300;1,9..40,400;1,9..40,500;1,9..40,600;1,9..40,700;1,9..40,800;1,9..40,900;1,9..40,1000&display=swap");
                    .boderCus {
                        margin-top: 150px;
                        border: 6px solid #b3db7d8a !important;
                        border-radius: 9px !important;
                        padding-top: 8px;
                        padding-right: 8px;
                        padding-left: 8px;
                    }
                
                    .TitleCus {
                        font-family: "DM Sans", sans-serif;
                        font-weight: 900;
                        font-size: 17px;
                        padding: 35px;
                    }
                
                    .Saludo {
                        font-family: "DM Sans", sans-serif;
                    }
                
                    .nameUser {
                        font-family: "DM Sans", sans-serif;
                        font-size: 14px;
                        font-weight: 900;
                    }
                
                    .mensaje {
                        font-family: "DM Sans", sans-serif;
                        text-align: justify;
                        font-size: 14px;
                        padding-bottom: 15px;
                    }
                
                    .btnCuston {
                        width: 160px;
                        font-family: "DM Sans", sans-serif;
                        background: #b3db7d;
                        display: block;
                        margin: auto;
                        border-radius: 24px;
                        color: #b3db7d;
                    }
                
                    .btnCuston:hover {
                        background: #b3db7d;
                        border: 1px solid #b3db7d;
                    }
                
                    .btnSpaCuston {
                        color: white;
                        font-size: 15px;
                        font-weight: bold;
                        letter-spacing: 20px;
                        margin-left: 20px;
                    }
                
                    #contador {
                        font-family: "DM Sans", sans-serif;
                        font-size: 14px;
                    }
                
                    .note {
                        padding-top: 22px;
                        font-family: "DM Sans", sans-serif;
                        font-size: 12px;
                        font-style: italic;
                        font-weight: bold;
                        text-align: justify;
                        margin-bottom: -10px;
                    }
                
                    .toast {
                        background: white;
                        position: absolute;
                        margin-left: 93px;
                        margin-top: -140px;
                        z-index: 999 !important;
                
                    }
                
                    #txtCopy {
                        font-family: "DM Sans", sans-serif;
                        font-weight: bold;
                    }
                
                    .headerCus {
                        display: block;
                        margin: auto;
                        background: #d6ecb9;
                        width: 105px;
                        height: 50px;
                        font-size: 25px;
                        text-align: center;
                        color: white;
                        border-radius: 8px;
                        margin-top: -50px;
                        z-index: -1;
                    }
                </style>
                
                
                <body>
                    <div class="container">
                        <div class="container">
                            <div class="row">
                                <div class="col"></div>
                                <div class="col-10">
                                    <div class="card boderCus">
                                        <div class="card-body">
                                            <h5 class="card-title TitleCus text-center">
                                                Restablecimiento de contraseña
                                            </h5>
                                            <p class="card-text Saludo">
                                                <span id="Saludo">Buen día,</span>
                                                <span id="user" class="nameUser">${usuarioEnvio.nombres} ${usuarioEnvio.apellidos}</span>
                                            </p>
                                            <p class="card-text mensaje">
                                                Para continuar con el proceso de recuperación de contraseña,
                                                ingrese el siguiente código de verificación:
                                            </p>
                                            <button type="button" class="btn btnCuston" id="toastbtn" data-bs-toggle="tooltip"
                                                data-bs-placement="right" data-bs-title="Toca para copia tu codigo">
                                                <span class="btnSpaCuston">${datosToken.clave}</span>
                                            </button>
                
                                            <br>
                                            <p id="contador">El código expira el <b>${datosToken.fechaExpiracion}</b></p>
                
                                            <p class="note">
                                                Este mensaje de correo se le ha enviado de forma automática.
                                                Por favor, no intente enviar correos a la dirección de este
                                                mensaje.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                             
                            </div>
                        </div>
                    </div>

                    </div>
                
                </body>
                
                </html>`,

            };

            this.transportador.sendMail(body);

        } catch (error) {
            console.error('Error al enviar correo:', error);
            res.status(500).json({ mensaje: 'Hemos tenido un problema al enviar el correo' });
        }

    }
}
