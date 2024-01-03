import { CanActivate, ExecutionContext, HttpStatus, Injectable } from "@nestjs/common";
import { CrudDireccionService } from "../crud-direccion.service";
import { MensajeAlerta, RespuestaPeticion } from "src/mensajes_usuario/mensajes-usuario.enum";

@Injectable()
export class GuardGerencia implements CanActivate {
    constructor(private readonly servicioDireccion: CrudDireccionService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const obtenerCuerpoDireccion = request.body;

        // const RespuestaDireccion = await this.servicioDireccion.validacionDireccion(obtenerCuerpoDireccion);

        // if (RespuestaDireccion) {
        //     // Devuelve una respuesta personalizada con código de estado 200
        //     const response = context.switchToHttp().getResponse();
        //     response.status(HttpStatus.OK).json({
        //         success: false,
        //         status: RespuestaPeticion.OK,
        //         message: `${MensajeAlerta.UPS} El nombre de gerencia ya se encuentra registrado.`,
        //     });

        //     return false; // Devuelve falso para indicar que la validación falló
        // }

        return true;
    }
}