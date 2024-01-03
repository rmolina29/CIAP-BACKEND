import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { ValidacionService } from '../validaciones_crudUsuario/validaciones_usuario_crud.service';
import { MensajeAlerta, RespuestaPeticion } from 'src/mensajes_usuario/mensajes-usuario.enum';



// este guardian me valida el registro y actualizacion de usuarios
@Injectable()
export class GuardActualizarUsuario implements CanActivate {
  constructor(private readonly validacionService: ValidacionService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const usuario = request.body;

    const validacionUsuario = await this.validacionService.excepcionesRegistroUsuarios(usuario);

    const existeProyecto = await this.validacionService.validarProyectoExisteUsuario(usuario);
    
    if (!validacionUsuario.success || !existeProyecto.success) {
      // Devuelve una respuesta personalizada con código de estado 200
      const response = context.switchToHttp().getResponse();
      response.status(HttpStatus.OK).json({
        success: false,
        status: RespuestaPeticion.OK,
        message: `${MensajeAlerta.UPS}, ${validacionUsuario.message || existeProyecto.message}`,
      });

      return false; // Devuelve falso para indicar que la validación falló
    }

    return true;
  }
}
@Injectable()
export class GuardRegistrarUsuario implements CanActivate {
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
        status: RespuestaPeticion.OK,
        message: `${MensajeAlerta.UPS}, ${validacionUsuario.message}`,
      });

      return false; // Devuelve falso para indicar que la validación falló
    }

    return true;
  }
}

// Guardian para actualizar el rol
@Injectable()
export class GuardRolActualizar implements CanActivate {
  constructor(private readonly validacionService: ValidacionService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const rol = request.body;

    const validacionrol = await this.validacionService.rolActualizarEstado(rol);

    if (!validacionrol.success) {
      // Devuelve una respuesta personalizada con código de estado 200
      const response = context.switchToHttp().getResponse();
      response.status(HttpStatus.OK).json({
        success: false,
        status: RespuestaPeticion.OK,
        message: `${MensajeAlerta.UPS}, ${validacionrol.message}`,
      });

      return false; // Devuelve falso para indicar que la validación falló
    }

    return true;
  }
}
