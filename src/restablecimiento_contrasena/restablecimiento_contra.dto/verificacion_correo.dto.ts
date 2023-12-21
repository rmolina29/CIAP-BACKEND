import { IsEmail, IsOptional, Length, MaxLength, MinLength } from 'class-validator';
import { validacionTipadoNumVacios, validacionTipoStringVacios } from 'src/dtoValidation/validacionesGlobalesDto';


export class email {
    @validacionTipoStringVacios('el email debe ser un string', 'el correo no debe ir vacio.')
    @IsEmail({}, { message: 'Formato de correo electrónico no válido' })
    mail: string;
}

export class tokenUsuario {
    @validacionTipadoNumVacios('el id del usuario debe ser un numero entero.', 'el id de usuario no debe ir vacio.')
    idUsuario: number;

    @validacionTipoStringVacios('el email debe ser un string', 'el correo no debe ir vacio.')
    @IsEmail({}, { message: 'Formato de correo electrónico no válido' })
    email: string
}

export class ContrasenaUsuario {
    @validacionTipadoNumVacios('el id del usuario debe ser un numero entero.', 'el id de usuario no debe ir vacio.')
    idUsuario: number;

    @validacionTipoStringVacios('la contarseña debe ser un string. ', 'la contarseña no puede ir vacio.')
    contrasena: string;

    @IsOptional()
    Recontrasena?: string;
}

export class tokenValidacion {

    @validacionTipadoNumVacios('el id del usuario debe ser un numero entero.', 'el id de usuario no debe ir vacio.')
    idUsuario: number

    @validacionTipadoNumVacios('el token debe ser un numero entero.', 'el token no debe ir vacio.')
    tokenUsuario: number
}

export class DatosToken {
    @validacionTipadoNumVacios('el id del usuario debe ser un numero entero.', 'la clave no debe ir vacio.')
    clave: number;

    @validacionTipoStringVacios('la fecha debe ser un string. ', 'la fecha no puede ir vacio.')
    fechaExpiracion: string;
}