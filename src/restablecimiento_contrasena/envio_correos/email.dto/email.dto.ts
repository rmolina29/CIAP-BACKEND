import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
import { validacionTipadoNumVacios, validacionTipoStringVacios } from "src/dtoValidation/validacionesGlobalesDto";


export class Email {
    @ApiProperty({ example: '1', description: 'id del usuario', required: true })
    @validacionTipadoNumVacios('el id del usuario debe ser un numero entero','el ide del usuario no puede estar vacia.')
    id_usuario:number;

    @ApiProperty({ example: 'Roberto', description: 'nombres del usuario', required: true })
    @validacionTipoStringVacios('los nombres de usuario debe ser un string','los nomrbes del usuario no pueden estar vacios.')
    nombres: string;

    @ApiProperty({ example: 'Molina', description: 'apellidos del usuario', required: true })
    @validacionTipoStringVacios('los apellidos de usuario debe ser un tipo string','el apellido del usuario no pueden estar vacios.')
    apellidos:string;

    @ApiProperty({ example: 'rmolina@ises.com.co', description: 'email del usuario', required: true })
    @validacionTipoStringVacios('el email debe ser un string', 'el correo no debe ir vacio.')
    @IsEmail({}, { message: 'Formato de correo electrónico no válido' })
    email: string;
}

