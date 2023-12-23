import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, Length, MaxLength, MinLength } from 'class-validator';
import { validacionTipadoNumVacios, validacionTipoStringVacios } from 'src/dtoValidation/validacionesGlobalesDto';


export class email {
    @ApiProperty({ example: 'rmolina@ises.com.co', description: 'correo del usuario', required: true })
    @validacionTipoStringVacios('el email debe ser un string', 'el correo no debe ir vacio.')
    @IsEmail({}, { message: 'Formato de correo electrónico no válido' })
    mail: string;
}

export class tokenUsuario {
    @ApiProperty({ example: '1', description: 'id del usuario', required: true })
    @validacionTipadoNumVacios('el id del usuario debe ser un numero entero.', 'el id de usuario no debe ir vacio.')
    idUsuario: number;

    @ApiProperty({ example: 'rmolina@ises.com.co', description: 'correo del usuario', required: true })
    @validacionTipoStringVacios('el email debe ser un string', 'el correo no debe ir vacio.')
    @IsEmail({}, { message: 'Formato de correo electrónico no válido' })
    email: string
}

export class ContrasenaUsuario {
    @ApiProperty({ example: '1', description: 'id del usuario', required: true })
    @validacionTipadoNumVacios('el id del usuario debe ser un numero entero.', 'el id de usuario no debe ir vacio.')
    idUsuario: number;

    @ApiProperty({ example: '090c3e5c98dd046a100a3402a1a070cc6796989bf060a01f604a3416263f2c83', description: 'contraseña del usuario', required: true })
    @validacionTipoStringVacios('la contarseña debe ser un string. ', 'la contarseña no puede ir vacio.')
    contrasena: string;

    @IsOptional()
    Recontrasena?: string;
}

export class tokenValidacion {
    @ApiProperty({ example: '2', description: 'id del usuario', required: true })
    @validacionTipadoNumVacios('el id del usuario debe ser un numero entero.', 'el id de usuario no debe ir vacio.')
    idUsuario: number

    @ApiProperty({ example: '3878', description: 'token', required: true })
    @validacionTipadoNumVacios('el token debe ser un numero entero.', 'el token no debe ir vacio.')
    tokenUsuario: number
}

export class DatosToken {
    @validacionTipadoNumVacios('el id del usuario debe ser un numero entero.', 'la clave no debe ir vacio.')
    clave: number;

    @validacionTipoStringVacios('la fecha debe ser un string. ', 'la fecha no puede ir vacio.')
    fechaExpiracion: string;
}