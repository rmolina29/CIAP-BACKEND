import { ApiProperty } from "@nestjs/swagger";
import { IsIn } from "class-validator";
import { validacionTipadoNumVacios, validacionTipoStringVacios } from "src/dtoValidation/validacionesGlobalesDto";
import { Estado } from "src/mensajes_usuario/mensajes-usuario.enum";


export class RolEstado {
    @ApiProperty({ example: '1', description: 'la id del rol que cambiara su estado.', required: true })
    @validacionTipadoNumVacios('el iddRol no debe ir vacio.', 'el id del rol debe ser un numero entero.')
    idRol: number;


    @ApiProperty({ example: Estado.Inactivo, description: 'el estado 0 (inactivo) 1 (activo)', required: true, minimum: 0, maximum: 1, enum: Estado })
    @validacionTipadoNumVacios('el estado no debe ir vacio.', 'el estado debe ser un numero entero.')
    @IsIn([0, 1], { message: 'el estado debe ser 0 o 1' })
    estado: number;
}



export class RolNombre {
    @ApiProperty({ example: '1', description: 'la id del rol que actualizara.', required: true })
    @validacionTipadoNumVacios('el iddRol no debe ir vacio.', 'el id del rol debe ser un numero entero.')
    idRol: number;

    @ApiProperty({ example: 'Plomero', description: 'la nombre del rol que actualizara.', required: true })
    @validacionTipoStringVacios('el nombre del rol debe ser un string. ', 'el nombre del rol no puede ir vacio.')
    nombreRol: string;
}

export class responseRolRegistro {
    status: string;
    mensaje: string;
    respuestHttp: number;
}

export class bodyRolRegistro {
    @ApiProperty({ example: 'PMO', description: 'Se agrega los roles', required: true })
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


export class RolMenu {
    [x: string]: any;
  
   
    @ApiProperty({ example: '5', description: 'la id del menu.', required: true })
    @validacionTipadoNumVacios('el id del menu no debe ir vacio.', 'el id del menu debe ser un numero entero.')
    idMenu: number;

    nombreTipoMenu: string;

    tipoMenuId: number;

    idMenuPadre: number;

    icono: string;

    programa: string;

    @ApiProperty({ example: Estado.Inactivo, description: 'el estado 0 (inactivo) 1 (activo)', required: true, minimum: 0, maximum: 1, enum: Estado })
    @validacionTipadoNumVacios('el estado no debe ir vacio.', 'el estado debe ser un numero entero.')
    @IsIn([0, 1], { message: 'el estado debe ser 0 o 1' })
    estado: number;
}
