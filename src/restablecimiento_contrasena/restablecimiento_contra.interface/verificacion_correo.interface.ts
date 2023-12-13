export interface email {
    mail: string,
}

export interface tokenUsuario {
    idUsuario: number,
    email: string
}

export interface ContrasenaUsuario {
    idUsuario: number,
    contrasena: string,
    Recontrasena?:string
}

export interface tokenValidacion {
    idUsuario: number
    tokenUsuario: number
}

export interface DatosToken {
    clave: number,
    fechaExpiracion: string
}