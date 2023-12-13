
export interface Usuario {
    nombre_usuario?: string,
    correo?: string,
    contrasena: string
}

export interface DataLogin {
    user: string;
    pass: string;
    mail: string;
}
export interface DataVerificacionUsuario {
    user?: string;
    mail?: string;
}

export interface RespuestaDataUsuario {
    id_ua: number;
    nombre_usuario: string;
    id_rol_usuario: number;
    nombre_rol:string;
    nombres: string;
    apellidos:string;
    estado_bloqueo:number;
    mail:string;
    estado_contrasena: string;
    fechaContrasena: string;
  }