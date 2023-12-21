
import { applyDecorators } from '@nestjs/common';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export function validacionTipadoNumVacios(mensajevalidacionEntero: string, mensajeValidacionVacio: string) {
    return applyDecorators(
        IsInt({ message: mensajevalidacionEntero }),
        IsNotEmpty({ message: mensajeValidacionVacio }),
    );
}

export function validacionTipoStringVacios(mensajevalidacionString: string, mensajeValidacionVacio: string) {
    return applyDecorators(
        IsString({ message: mensajevalidacionString }),
        IsNotEmpty({ message: mensajeValidacionVacio }),
    );
}

export function validacionCamposVaciosString(mensajeString: string, mensajeVacio: string) {
    return applyDecorators(
        IsOptional(),
        IsString({ message: mensajeString }),
        IsNotEmpty({ message: mensajeVacio }),
    );
}

