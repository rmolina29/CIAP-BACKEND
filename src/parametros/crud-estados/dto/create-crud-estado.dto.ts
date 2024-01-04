import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";
import { validacionTipadoNumVacios, validacionTipoStringVacios } from "src/dtoValidation/validacionesGlobalesDto";


export class EstadosDto {
    @ApiProperty({ example: '1', description: 'Hace referencia al id que representa los estados de los proyectos.', required: true })
    @validacionTipadoNumVacios('el id debe ser numerico', 'el id no pueden ir vacio.')
    @IsOptional()
    id?: number;

    @ApiProperty({ example: 'Pausa', description: 'Hace referencia al estado que pueden tener los proyectos.', required: true })
    @validacionTipoStringVacios('la descripcion del estado debe ser una cadena de texto.', 'el nombre de la direccion no puede ir vacia.')
    descripcion: string;

    @ApiProperty({ example: 'pau', description: 'Hace referencia al estado id del ERP.', required: true })
    @validacionTipoStringVacios('el erp del estado debe ser una cadena de texto.', 'el nombre de la direccion no puede ir vacia.')
    estadoIdErp: string;


}

export class Estado {
    @ApiProperty({ example: '1', description: 'Hace referencia al id que representa la Direccion.', required: true })
    @validacionTipadoNumVacios('el id debe ser numerico', 'el id no pueden ir vacio.')
    id: number;
    @ApiProperty({ example: '1', description: 'Hace referencia al estado .', required: true })
    @validacionTipadoNumVacios('el estado debe ser numerico', 'el id no pueden ir vacio.')
    estado: string;


}
