import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";
import { validacionCamposVaciosString, validacionMinimoMaximo, validacionTipadoNumVacios, validacionTipoStringVacios } from "src/dtoValidation/validacionesGlobalesDto";


export class Menu {
    [x: string]: any;

    @ApiProperty({ example: '1', description: 'la id del menu que se hara parra asiganrle un modulo al rol.', required: true })
    @validacionTipadoNumVacios('el id del menu no debe ir vacio.', 'el id del menu debe ser un numero entero.')
    id_menu: number;

    @ApiProperty({ example: '[1,2,3]', description: 'se envia los permisos asignados al rol.', required: true })
    @IsNotEmpty({ message: 'no debe ir vacio el id de permisos del menu.' })
    @validacionMinimoMaximo('se ha pasado el limite de permisos')
    id_permisos: number[];
}

export class PermisosRol {
    @ApiProperty({ example: '1', description: 'la id del rol que cambiara su estado.', required: true })
    @validacionTipadoNumVacios('el iddRol no debe ir vacio.', 'el id del rol debe ser un numero entero.')
    idRol: number;

    @ApiProperty({
        example: `[
        {   
            "id_menu": 5, 
            "id_permisos": [3,4,1] 
        },
        { 
            "id_menu": 1, 
            "id_permisos": [1,2] 
         }
    ]`, description: 'la id del rol que cambiara su estado.', required: true
    })
    @IsNotEmpty({ message: 'no debe ir vacio el menu.' })
    menus: Menu;
}

export class RegistrarRolPermios {

    @ApiProperty({ example: 'PMO', description: 'el nombre del rol a registrar.', required: true })
    @validacionTipoStringVacios('el id del rol debe ser un string.','el id del rol debe ser un string.')
    nombreRol: string;

    @ApiProperty({
        example: `[
        {   
            "id_menu": 5, 
            "id_permisos": [3,4,1] 
        },
        { 
            "id_menu": 1, 
            "id_permisos": [1,2] 
         }
    ]`, description: 'la id del rol que cambiara su estado.', required: true
    })
    @IsNotEmpty({ message: 'no debe ir vacio el menu.' })
    menus: Menu;
}

export class Permisos {
    @ApiProperty({ example: '1', description: 'la id del permiso.', required: true })
    id: string;

    @ApiProperty({ example: '1', description: 'se envia el id del permiso.', required: true })
    permiso: string;

    @ApiProperty({ example: 'C', description: 'se envia la abreviatura del permiso, si es crear C, si es actualizar A, si es eliminar E.', required: true })
    abreviatura: string;
}

export class MenuRol {
    @ApiProperty({ example: 1, description: 'la id del permiso.', required: true })
    id: number;

    @ApiProperty({ example: 'Indicadores', description: 'recibe la descripcion del permiso.', required: true })
    permiso: string;

    @ApiProperty({ example: 3, description: 'menu tipo id.', required: true })
    tipo_menu_id: number;

    @ApiProperty({ example: '0', description: 'recibe el id del menu padre si es 0 es porque es el padre.', required: true })
    id_menu_padre: string;

    @ApiProperty({ example: 'icono', description: 'img icono.', required: true })
    icono: string;

    @ApiProperty({ example: 'programa', description: 'url programa.', required: true })
    programa: string;
}

