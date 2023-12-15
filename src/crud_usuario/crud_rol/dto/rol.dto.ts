import { IsInt, IsNotEmpty } from "class-validator";


export class RolEstado {

    @IsNotEmpty({ message: 'el id rol no puede ir vacio' })
    @IsInt({ message: 'el id rol debe ser numerico' })
    idRol: number;

    @IsNotEmpty({ message: 'el estado del rol no puede ir vacio' })
    @IsInt({ message: 'el estado del rol debe ser numerico' })
    estado: number;

}



export class RolNombre {
    idRol: number;
    nombreRol: string;
}

export class responseRolRegistro {
    status: string;
    mensaje: string;
    respuestHttp: number;
}

export class bodyRolRegistro {
    nombreRol: string;
}

export class DataRol {
    id: number;
    tipo: string;
    estado: number;
    fechasistema: string;
}

