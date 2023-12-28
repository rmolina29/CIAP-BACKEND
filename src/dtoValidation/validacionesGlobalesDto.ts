
import { applyDecorators } from '@nestjs/common';
import { ArrayMaxSize, IsArray, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export function validacionTipadoNumVacios(mensajevalidacionEntero: string, mensajeValidacionVacio: string) {
    return applyDecorators(
        IsInt({ message: mensajevalidacionEntero }),
        IsNotEmpty({ message: mensajeValidacionVacio }),
    );
}
export function validacionMinimoMaximo(alertaLimitePermisos: string) {
    return applyDecorators(
        IsArray({ message: 'formato de envio equivocado' }),
        ArrayMaxSize(4, { message:'el maximo de permisos son 4'}),


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

