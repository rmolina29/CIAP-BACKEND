import { IsEmail, IsOptional, Matches } from "class-validator";
import { validacionTipadoNumVacios, validacionTipoStringVacios } from "src/dtoValidation/validacionesGlobalesDto";

export class DatosUsuario {

    @IsOptional()
    @validacionTipadoNumVacios('el id del del usuario debe ser numerica', 'el id del usuario no pueden estar vacíos')
    idUsuario?: number;

    @validacionTipoStringVacios('los nombres del usuario deben ser string', 'los nombres del usuario no pueden estar vacíos')
    nombres: string;

    @validacionTipoStringVacios('los apellios del usuario deben ser string', 'los apellidos el usuario no pueden estar vacíos')
    apellidos: string;

    @validacionTipoStringVacios('la identificacion del usuario debe ser string', 'la identifiacion el usuario no pueden estar vacíos')
    identificacion: string;

    @validacionTipadoNumVacios('el id del rol deben ser numerica', 'el id rol del usuario no pueden estar vacíos')
    idRol: number;

    @validacionTipoStringVacios('el email debe ser un string', 'el correo no debe ir vacio.')
    @IsEmail({}, { message: 'Formato de correo electrónico no válido' })
    correo: string;

}