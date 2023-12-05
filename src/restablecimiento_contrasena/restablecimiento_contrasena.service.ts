import { Injectable } from '@nestjs/common';

@Injectable()
export class RestablecimientoContrasenaService {
    ObtenerPrueba(): Object {
        const data = { 'mensaje': 'prueba ok' }
        return data
    }
}
