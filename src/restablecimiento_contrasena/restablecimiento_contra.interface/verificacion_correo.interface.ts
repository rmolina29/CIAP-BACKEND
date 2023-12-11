export interface email {
    mail: string,
}

export interface tokenUsuario {
    id:number,
    email:string
}

export interface ContrasenaUsuario{
    id:number,
    contrasena:string
}

export interface tokenValidacion{
    idUsuario:number
    tokenUsuario:number
}