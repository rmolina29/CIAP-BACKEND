import { Controller, Get, Res } from '@nestjs/common';
import { RestablecimientoContrasenaService } from './restablecimiento_contrasena.service';

@Controller('password')
export class RestablecimientoContrasenaController {

    constructor(private readonly serviceContrasena: RestablecimientoContrasenaService) {

    }

    @Get('change')
    contrasena_cambio(): Object {
        const data = this.serviceContrasena.ObtenerPrueba()
        return data
    }

}
