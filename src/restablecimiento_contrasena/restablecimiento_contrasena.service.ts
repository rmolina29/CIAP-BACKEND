import { Injectable, OnModuleInit } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { Connection } from 'mariadb';
import {  email } from './restablecimiento_contra.interface.ts/verificacion_correo.interface';

@Injectable()
export class RestablecimientoContrasenaService implements OnModuleInit{
    
    private conexion:Connection;
    constructor(private readonly dbConexionServicio: DatabaseService) {
        
    }

    async onModuleInit() {
       this.conexion = await this.dbConexionServicio.connectToDatabase()
    }

    async email_usuario_existe(verificacion:email):Promise<any> {
        this.conexion = this.dbConexionServicio.getConnection()

        let mail = verificacion.mail ?? ''

        mail = mail.trim();
        
        let sql = `SELECT id,correo,estado FROM usuario_datos_personales WHERE correo = '${mail}'`;

        let respuesta_email = await this.conexion.query(sql);

        return respuesta_email;


    }
}
