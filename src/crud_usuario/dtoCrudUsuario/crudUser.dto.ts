import { IsEmail, Matches } from "class-validator";
import { validacionTipadoNumVacios, validacionTipoStringVacios } from "src/dtoValidation/validacionesGlobalesDto";

export class DatosPersonales {

    @validacionTipoStringVacios('los nombres del usuario deben ser string', 'los nombres del usuario no pueden estar vacíos')
    nombres: string;

    @validacionTipoStringVacios('los apellios del usuario deben ser string', 'los apellidos el usuario no pueden estar vacíos')
    apellidos: string;

    @validacionTipadoNumVacios('la identificacion del usuario deben ser numerica', 'la identifiacion el usuario no pueden estar vacíos')
    identificacion: number;

    @validacionTipoStringVacios('el email debe ser un string', 'el correo no debe ir vacio.')
    @IsEmail({}, { message: 'Formato de correo electrónico no válido' })
    correo: string;

}