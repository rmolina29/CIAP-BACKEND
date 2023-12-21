import { IsIn } from "class-validator";
import { validacionTipadoNumVacios, validacionTipoStringVacios } from "src/dtoValidation/validacionesGlobalesDto";


export class RolEstado {
    @validacionTipadoNumVacios('el iddRol no debe ir vacio.', 'el id del rol debe ser un numero entero.')
    idRol: number;

    @validacionTipadoNumVacios('el estado no debe ir vacio.', 'el estado debe ser un numero entero.')
    @IsIn([0, 1], { message: 'el estado debe ser 0 o 1' })
    estado: number;
}



export class RolNombre {
    @validacionTipadoNumVacios('el iddRol no debe ir vacio.', 'el id del rol debe ser un numero entero.')
    idRol: number;

    @validacionTipoStringVacios('el nombre del rol debe ser un string. ', 'el nombre del rol no puede ir vacio.')
    nombreRol: string;
}

export class responseRolRegistro {
    status: string;
    mensaje: string;
    respuestHttp: number;
}

export class bodyRolRegistro {
    @validacionTipoStringVacios('el nombre del rol debe ser un string. ', 'el nombre del rol no puede ir vacio.')
    nombreRol: string;
}

export class DataRol {
    @validacionTipadoNumVacios('el id rol no debe ir vacio.', 'el id de rol debe ser un numero entero.')
    id: number;


    @validacionTipoStringVacios('el tipo de rol debe ser un string. ', 'el tipo de rol no puede ir vacio.')
    tipo: string;

    @validacionTipadoNumVacios('el estado no debe ir vacio.', 'el estado debe ser un numero entero.')
    estado: number;

    @validacionTipoStringVacios('la fecha debe ser un string. ', 'el la fecha del rol no puede ir vacio.')
    fechasistema: string;
}

