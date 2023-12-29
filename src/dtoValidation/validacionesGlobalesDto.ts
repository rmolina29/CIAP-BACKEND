
import { applyDecorators } from '@nestjs/common';
import { ArrayMaxSize, IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import {
    IsInt,
    Min,
    Max,
    MaxLength
} from '@nestjs/class-validator';

export function validacionTipadoNumVacios(mensajevalidacionEntero: string, mensajeValidacionVacio: string) {
    return applyDecorators(
        IsInt({ message: mensajevalidacionEntero }),
        IsNotEmpty({ message: mensajeValidacionVacio }),
    );
}
export function validacionMinimoMaximo() {
    return applyDecorators(
        IsArray({ message: 'formato de envio equivocado' }),
        ArrayMaxSize(4, { each: true, message: 'el maximo de permisos son 4' }),
        Min(1, { each: true, message: 'el permiso que ha generado no existe.' }),
        Max(4, { each: true, message: 'el permiso que ha generado no existe.' })
    )
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

