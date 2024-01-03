import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";
import { validacionTipadoNumVacios, validacionTipoStringVacios } from "src/dtoValidation/validacionesGlobalesDto";

export class DireccionDto {

    @ApiProperty({ example: '1', description: 'Este id hace referencia al id de direcciones', required: true })
    @validacionTipadoNumVacios('el id debe ser numerico', 'el id no pueden ir vacio.')
    @IsOptional()
    id: number;

    @ApiProperty({ example: 'DiseñoGrafic10939', description: 'Hace referencia al codigo de referencia o ERP.', required: true })
    @validacionTipoStringVacios('el erp debe ser tipo string', 'el erp no pueden ir vacio.')
    idDireccionErp: string;

    @ApiProperty({ example: 'Diseño grafico', description: 'Hace referencia al nombre de la gerencia.', required: true })
    @validacionTipoStringVacios('el nombre de la direccion debe ser string.', 'el nombre de la direccion no puede ir vacia.')
    nombre: string;

    @ApiProperty({ example: '1', description: 'Hace referencia al al id de la gerencia.', required: true })
    @validacionTipadoNumVacios('el id de la gerencia no debe ir vacio.', 'el id de la gerencia debe ser un numero entero.')
    idGerencia: number;
}

export class EstadoDireccion {
    @ApiProperty({ example: '1', description: 'Hace referencia al id que representa la Direccion.', required: true })
    @validacionTipadoNumVacios('el id debe ser numerico', 'el id no pueden ir vacio.')
    idDireccion: number;
    @ApiProperty({ example: '1', description: 'Hace referencia al estado de la Direccion.', required: true })
    @validacionTipadoNumVacios('el estado debe ser numerico', 'el id no pueden ir vacio.')
    estadoDireccion: number;
}
