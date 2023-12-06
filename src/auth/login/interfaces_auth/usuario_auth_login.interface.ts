
export interface Usuario {
    nombre_usuario?: string,
    correo?: string,
    contrasena: string
}

export interface RespuestaDataUsuario {
    id_ua: number;
    nombre_usuario: string;
    id_rol_usuario: number;
    id_udp: number;
    nombres: string;
    id_urc: number;
    estado_contrasena: string;
  }