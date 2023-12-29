import { CanActivate, ExecutionContext, HttpStatus, Injectable } from "@nestjs/common";
import { ValidacionService } from "../validaciones_crudUsuario/validaciones_usuario_crud.service";
import { MensajeAlerta, RespuestaPeticion } from "src/mensajes_usuario/mensajes-usuario.enum";

@Injectable()
export class GuardsRolGuard implements CanActivate {
    constructor(private readonly validacionService: ValidacionService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const { nombreRol } = request.body;

        const rolExiste = await this.validacionService.validardRolExiste(nombreRol);

        if (!rolExiste.success) {
            // Devuelve una respuesta personalizada con código de estado 200
            const response = context.switchToHttp().getResponse();
            response.status(HttpStatus.OK).json({
                success: false,
                status: RespuestaPeticion.OK,
                message: `${MensajeAlerta.UPS}, ${rolExiste.message}`,
            });

            return false; // Devuelve falso para indicar que la validación denegada
        }

        return true;
    }
}
@Injectable()
export class GuardsMenulGuard implements CanActivate {
    constructor(private readonly validacionService: ValidacionService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const { menus } = request.body;

        const menuExiste = await this.validacionService.validardMenuExiste(menus);

        if (!menuExiste.success) {
            // Devuelve una respuesta personalizada con código de estado 200
            const response = context.switchToHttp().getResponse();
            response.status(HttpStatus.OK).json({
                success: false,
                status: RespuestaPeticion.OK,
                message: `${MensajeAlerta.UPS} ${menuExiste.message}`,
            });

            return false; // Devuelve falso para indicar que la validación denegada
        }

        return true;
    }
}