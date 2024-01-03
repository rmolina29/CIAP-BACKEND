import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, Max, Min } from "class-validator";
import { validacionTipadoNumVacios, validacionTipoStringVacios } from "src/dtoValidation/validacionesGlobalesDto";

export class Cliente {

    @ApiProperty({ example: '1', description: 'Este id hace referencia al id de los clientes', required: true })
    @validacionTipadoNumVacios('el id debe ser numerico', 'el id no pueden ir vacio.')
    @IsOptional()
    id: number;

    @ApiProperty({ example: '100508363', description: 'Hace referencia al codigo de referencia o ERP.', required: true })
    @validacionTipadoNumVacios('El NIT debe ser numerico', 'El NIT no puede ir vacio.')
    @Min(1000, { message: 'El NIT debe tener minimo 4 digitos.' })
    @Max(99999999999, { message: 'El NIT debe tener maximo 11 digitos.' })
    identificacion: number;

    @ApiProperty({ example: 'tripleAAA', description: 'Hace referencia al cliente id ERP.', required: true })
    @validacionTipoStringVacios('el nombre de la direccion debe ser string.', 'el nombre de la direccion no puede ir vacia.')
    clienteIdErp: string;

    @ApiProperty({ example: 'Triple A S.A. ESP', description: 'Hace referencia a la razon social del cliente.', required: true })
    @validacionTipoStringVacios('La razon social del cliente debe ser string.', 'La razon social del cliente no debe ir vacia.')
    razonSocial: string;

}

export class EstadoCLiente {
    @ApiProperty({ example: '1', description: 'Hace referencia al id que representa el cliente de parametros.', required: true })
    @validacionTipadoNumVacios('el id debe ser numerico', 'el id no pueden ir vacio.')
    id: number;
    @ApiProperty({ example: '0', description: 'Hace referencia al estado del cliente.', required: true })
    @validacionTipadoNumVacios('el estado debe ser numerico', 'el id no pueden ir vacio.')
    estado: number;
}

