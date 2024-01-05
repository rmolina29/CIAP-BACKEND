import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";
import { validacionTipadoNumVacios, validacionTipoStringVacios } from "src/dtoValidation/validacionesGlobalesDto";


export class Gerencia {

    @ApiProperty({ example: '1', description: 'Hace referencia al id que representa la gerencia.', required: true })
    @validacionTipadoNumVacios('el id debe ser numerico', 'el id no pueden ir vacio.')
    @IsOptional()
    id: number;

    @ApiProperty({ example: 'DiseñoGrafic10939', description: 'Hace referencia al codigo de referencia o ERP.', required: true })
    @validacionTipoStringVacios('el erp debe ser tipo string', 'el erp no pueden ir vacio.')
    idGerenciaErp: string;

    @ApiProperty({ example: 'Diseño grafico', description: 'Hace referencia al nombre de la gerencia.', required: true })
    @validacionTipoStringVacios('el nombre de la descripcion debe ser string.', 'el nombre de la gerencia no puede ir vacia.')
    nombre: string;

    @ApiProperty({ example: '1', description: 'Hace referencia al responsable de la gerencia.', required: true })
    @validacionTipadoNumVacios('el id rol no debe ir vacio.', 'el id de rol debe ser un numero entero.')
    idResponsable: number;

}


export class EstadoGerencia {
    @ApiProperty({ example: '1', description: 'Hace referencia al id que representa la gerencia.', required: true })
    @validacionTipadoNumVacios('el id debe ser numerico', 'el id no pueden ir vacio.')
    idGerencia: number;
    @ApiProperty({ example: '1', description: 'Hace referencia al estado de la gerencia.', required: true })
    @validacionTipadoNumVacios('el estado debe ser numerico', 'el id no pueden ir vacio.')
    estadoGerencia: number;
}

