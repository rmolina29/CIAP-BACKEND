import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { validacionTipadoNumVacios } from "src/dtoValidation/validacionesGlobalesDto";


class Menu {
    [x: string]: any;

    @ApiProperty({ example: '1', description: 'la id del menu que se hara parra asiganrle un modulo al rol.', required: true })
    @validacionTipadoNumVacios('el id del menu no debe ir vacio.', 'el id del menu debe ser un numero entero.')
    id_menu: number;

    @ApiProperty({ example: '[1,2,3]', description: 'se envia los permisos asignados al rol.', required: true })
    @IsNotEmpty({ message: 'no debe ir vacio el id de permisos del menu.' })
    id_permisos: number[];
}

export class PermisosRol {
    @ApiProperty({ example: '1', description: 'la id del rol que cambiara su estado.', required: true })
    @validacionTipadoNumVacios('el iddRol no debe ir vacio.', 'el id del rol debe ser un numero entero.')
    idRol: number;

    @ApiProperty({ example: '1', description: 'la id del rol que cambiara su estado.', required: true })
    @IsNotEmpty({ message: 'no debe ir vacio el menu.' })
    menus: Menu;
}


