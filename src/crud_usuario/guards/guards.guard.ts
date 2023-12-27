import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { ValidacionService } from '../validaciones_crudUsuario/validaciones_usuario_crud.service';


@Injectable()
export class GuardsGuard implements CanActivate {
  constructor(private readonly validacionService: ValidacionService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const usuario = request.body;

    const validacionUsuario = await this.validacionService.excepcionesRegistroUsuarios(usuario);

    if (!validacionUsuario.success) {
      // Devuelve una respuesta personalizada con código de estado 200
      const response = context.switchToHttp().getResponse();
      response.status(HttpStatus.OK).json({
        success: false,
        status: 'ok',
        message: `Problema de validación: ${validacionUsuario.message}`,
      });

      return false; // Devuelve falso para indicar que la validación falló
    }

    return true;
  }
}
@Injectable()
export class GuardRolActualizar implements CanActivate {
  constructor(private readonly validacionService: ValidacionService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const usuario = request.body;

    const validacionUsuario = await this.validacionService.excepcionesRegistroUsuarios(usuario);

    if (!validacionUsuario.success) {
      // Devuelve una respuesta personalizada con código de estado 200
      const response = context.switchToHttp().getResponse();
      response.status(HttpStatus.OK).json({
        success: false,
        status: 'ok',
        message: `Problema de validación: ${validacionUsuario.message}`,
      });

      return false; // Devuelve falso para indicar que la validación falló
    }

    return true;
  }
}