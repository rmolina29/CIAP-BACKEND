import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { validacionCamposVaciosString, validacionTipadoNumVacios, validacionTipoStringVacios } from 'src/dtoValidation/validacionesGlobalesDto';

export class DataLogin {

    @ApiProperty({ example: 'rmolina', description: 'Nombre del usuario',required: false  })
    @validacionCamposVaciosString('el nombre de usuario debe ser un string', 'el nombre de usuario no debe ir vacio.')
    user?: string;

    @ApiProperty({ example: '', description: 'Contraseña' })
    @IsString({ message: 'La contraseña debe ser un string' })
    @IsNotEmpty({ message: 'La contraseña no puede ir vacía' })
    pass: string;

    @ApiProperty({ example: '', description: 'Correo',required: false })
    @validacionCamposVaciosString('el email debe ser un string', 'el correo no debe ir vacio.')
    @IsEmail({}, { message: 'Formato de correo electrónico no válido' })
    mail?: string;
}

export class DataVerificacionUsuario {
    @validacionCamposVaciosString('el nombre de usuario debe ser un string', 'el nombre de usuario no debe ir vacio.')
    user?: string;

    @validacionCamposVaciosString('el email debe ser un string', 'el correo no debe ir vacio.')
    @IsEmail({}, { message: 'Formato de correo electrónico no válido' })
    mail?: string;
}

export class RespuestaDataUsuario {
    @validacionTipadoNumVacios('el id del usuario debe ser un entero y no puede estar vacío', 'el id del usuario no puede estar vacío')
    id_ua: number;

    @validacionTipoStringVacios('el nombre del usuario debe ser un string', 'el nombre de usuario no puede estar vacío')
    nombre_usuario: string;

    @validacionTipadoNumVacios('el id del rol del usuario debe ser un entero', 'el id del rol no puede estar vacío. ')
    id_rol_usuario: number;

    @validacionTipoStringVacios('el nombre del rol debe ser string. ', 'el nombre del rol no puede estar vacío. ')
    nombre_rol: string;

    @validacionTipoStringVacios('los nombres del usuario deben ser string', 'los nombres del usuario no pueden estar vacíos')
    nombres: string;

    @validacionTipoStringVacios('los apellios del usuario deben ser string', 'los apellidos el usuario no pueden estar vacíos')
    apellidos: string;

    @validacionTipadoNumVacios('el estado de bloqueo debe ser un entero', 'el estado de bloqueo no puede estar vacíos')
    estado_bloqueo: number;

    @validacionTipoStringVacios('el correo debe ser un string ', 'el correo no puede estar vacio')
    @IsEmail({}, { message: 'Formato de correo electrónico no válido' })
    mail: string;

    @validacionTipoStringVacios('el estado de la contraseña debe ser un string. ', 'el estado de la contarseña del usuario no pueden estar vacíos')
    estado_contrasena: string;

    @validacionTipoStringVacios('la fecha de la contraseña debe ser un string. ', 'la fecha de la contraseña no puede estar vacía')
    fechaContrasena: string;

    @validacionTipadoNumVacios('el tipo de contraseña debe ser un entero. ', 'el tipo de contraseña no puede estar vacío. ')
    tipo_contrasena: number;

    @validacionTipadoNumVacios('el tipo de bloqueo debe ser un entero. ', 'el tipo de bloqueo no puede estar vacío. ')
    bloqueo_cuenta_usuario: number;
}

export class datosObjetoCuerpoHtml{
    tiempoRelogin:number;
    fechaBloqueo:string;
    cantidadLoginValidos:number;

}

