import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";
import { validacionTipadoNumVacios, validacionTipoStringVacios } from "src/dtoValidation/validacionesGlobalesDto";

export class Ceco {

    @ApiProperty({ example: '1', description: 'Este id hace referencia al id de direcciones', required: true })
    @validacionTipadoNumVacios('el id debe ser numerico', 'el id no pueden ir vacio.')
    @IsOptional()
    id: number;

    @ApiProperty({ example: 'afn1234', description: 'El id del ceco erp hace referncia a la identificacion del ceco.', required: true })
    @validacionTipoStringVacios('el erp del ceco de la direccion debe ser string.', 'el erp del ceco de la direccion de la direccion no puede ir vacia.')
    idCecoErp: string;

    @ApiProperty({ example: 'AFN200231-100', description: 'consecutivo', required: true })
    @validacionTipoStringVacios('El consecutivo del ceco debe ser string.', 'El consecutivo del ceco no puede ir vacia.')
    nombre: string;

    @ApiProperty({ example: 'Gerencia TI', description: 'descricpcion del ceco', required: true })
    @validacionTipoStringVacios('La descripcion del ceco debe ser string.', 'La descripcion del ceco no puede ir vacia.')
    descripcion: string;
}

export class CecoEstado {
    @ApiProperty({ example: '1', description: 'Hace referencia al id que representa el Ceco.', required: true })
    @validacionTipadoNumVacios('el id debe ser numerico', 'el id no pueden ir vacio.')
    idCeco: number;
    @ApiProperty({ example: '0', description: 'Hace referencia al estado del Ceco.', required: true })
    @validacionTipadoNumVacios('el estado debe ser numerico', 'el id no pueden ir vacio.')
    estadoCeco: number;
}
