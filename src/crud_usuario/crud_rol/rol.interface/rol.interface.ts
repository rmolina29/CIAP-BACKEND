export interface RolEstado {
    idRol: number;
    estado: number;
}
export interface RolNombre {
    idRol: number;
    nombreRol: string;
}

export interface responseRolRegistro {
    status: string;
    mensaje: string;
    respuestHttp: number;
}

export interface bodyRolRegistro {
    nombreRol: string;
}

export interface DataRol {
    id: number;
    tipo: string;
    estado: number;
    fechasistema: string;
}

