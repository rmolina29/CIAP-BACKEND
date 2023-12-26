import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ValidacionService } from '../validaciones_crudUsuario/validaciones_usuario_crud.service';

@Injectable()

export class GuardsGuard implements CanActivate {

  constructor(private readonly validacionService: ValidacionService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const usuario = request.body;

    const validacionUsuario = await this.validacionService.excepcionesRegistroUsuarios(usuario);

    if (!validacionUsuario.success) {
      throw new UnauthorizedException(`Problema de validación: ${validacionUsuario.message}`);
    }

    return true;
  }
}
