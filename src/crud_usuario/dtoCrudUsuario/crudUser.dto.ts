import { ApiProperty } from "@nestjs/swagger";
import { ArrayMinSize, IsEmail, IsIn, IsOptional, Matches } from "class-validator";
import { validacionTipadoNumVacios, validacionTipoStringVacios } from "src/dtoValidation/validacionesGlobalesDto";
import { Estado } from "src/mensajes_usuario/mensajes-usuario.enum";

export class DatosUsuario {

    @ApiProperty({ example: '1', description: 'la id del usuario (solo se usara cuando se vaya a actualizar).', required: false })
    @IsOptional()
    @validacionTipadoNumVacios('el id del del usuario debe ser numerica', 'el id del usuario no pueden estar vacíos')
    idUsuario?: number;

    @ApiProperty({ example: 'Andrea Camila', description: 'nombres del usuario.', required: true })
    @validacionTipoStringVacios('los nombres del usuario deben ser string', 'los nombres del usuario no pueden estar vacíos')
    nombres: string;

    @ApiProperty({ example: 'Suarez Campos', description: 'apellidos del usuario.', required: true })
    @validacionTipoStringVacios('los apellios del usuario deben ser string', 'los apellidos el usuario no pueden estar vacíos')
    apellidos: string;

    @ApiProperty({ example: '1005081321', description: 'identificacion del usuario.', required: true, uniqueItems: true })
    @validacionTipoStringVacios('la identificacion del usuario debe ser string', 'la identifiacion el usuario no pueden estar vacíos')
    identificacion: string;

    @ApiProperty({ example: '2', description: 'rol que se le asignara del usuario.', required: true })
    @validacionTipadoNumVacios('el id del rol deben ser numerica', 'el id rol del usuario no pueden estar vacíos')
    idRol: number;

    @ApiProperty({ example: 'asuarez@ises.com.co', description: 'el email que se le asignara al usuario.', required: true, uniqueItems: true })
    @validacionTipoStringVacios('el email debe ser un string', 'el correo no debe ir vacio.')
    @IsEmail({}, { message: 'Formato de correo electrónico no válido' })
    correo: string;

    @ApiProperty({ example: [1, 2], description: 'el poyecto o proyectos que se le asignaran a el usuario.', required: true, uniqueItems: true })
    @ArrayMinSize(1, { message: 'Debe proporcionar al menos un proyecto' })
    idProyecto: number[];

}
export class CuentasUsuario {

    usuario: string;
    identificacion: string;
    nombre: string;
    apellidos: string;
    correo: string;
    tipo: string;
    estado: number;

}
export class UsuarioId {
    @ApiProperty({ example: '1', description: 'id del usuario.', required: true, minimum: 1 })
    @validacionTipadoNumVacios('el id del del usuario debe ser numerica', 'el id del usuario no pueden estar vacíos')
    id: number;
}


export class EstadoUsuario {
    @ApiProperty({ example: '1', description: 'nombres del usuario.', required: true, minimum: 1 })
    @validacionTipadoNumVacios('el id del usuario debe ser numerica', 'el id del usuario no pueden estar vacíos')
    idUsuario: number;

    @ApiProperty({ example: Estado.Activo, description: 'nombres del usuario.', required: true, minimum: 0, maximum: 1, enum: Estado })
    @validacionTipadoNumVacios('el id del estado del usuario debe ser numerica', 'el id del estado usuario no pueden estar vacíos')
    @IsIn([0, 1], { message: 'el estado debe ser 0 o 1' })
    idEstado: number;
}
export class ProyectoIdUsuario {
    @ApiProperty({ example: '1', description: 'filtro por el id del usuario.', required: true })
    @validacionTipadoNumVacios('el id del usuario debe ser numerica', 'el id del usuario no pueden estar vacíos')
    idUsuario: number;
}

export class ProyectosActivos {
    map(arg0: (proyecto: { id: number; }) => number): number[] {
        throw new Error('Method not implemented.');
    }

    @validacionTipadoNumVacios('el id del proyecto debe ser numerica', 'el id del proyecto no pueden estar vacíos')
    idProyecto: number;

    @validacionTipoStringVacios('el nombre del proyecto debe ser un string', 'el nombre del proyecto no debe ir vacio.')
    nombreProyetco: string;
}

export class InformacionProyecto {

    proyecto_id: number;

    nombre_proyecto: string;
}