
export interface Usuario {
    nombre_usuario?: string,
    correo?: string,
    contrasena: string
}

export interface RespuestaDataUsuario {
    map(arg0: (item: any) => { id_ua: any; nombre_usuario: any; id_rol_usuario: any; id_udp: any; nombres: any; id_urc: any; estado_contrasena: any; }): unknown;
    id_ua: number;
    nombre_usuario: string;
    id_rol_usuario: number;
    id_udp: number;
    nombres: string;
    id_urc: number;
    estado_contrasena: string;
  }