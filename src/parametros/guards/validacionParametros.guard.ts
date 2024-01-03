import { CanActivate, ExecutionContext, HttpStatus, Injectable } from "@nestjs/common";
import { ParametrosService } from "../parametros.service"; 
import { MensajeAlerta, RespuestaPeticion } from "src/mensajes_usuario/mensajes-usuario.enum";

@Injectable()
export class GuardParametros implements CanActivate {
    constructor(private readonly parametro : ParametrosService) { }

     async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const gerencia = request.body;

        const validacionGerenica = await this.parametro.validacionParametros(gerencia);
        
        if (validacionGerenica) {
            // Devuelve una respuesta personalizada con código de estado 200
            const response = context.switchToHttp().getResponse();
            response.status(HttpStatus.OK).json({
                success: false,
                status: RespuestaPeticion.OK,
                message: `${MensajeAlerta.UPS} El nombre de gerencia ya se encuentra registrado.`,
            });

            return false; // Devuelve falso para indicar que la validación falló
        }

        return true;
    }
}