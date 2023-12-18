import { Injectable } from '@nestjs/common';
import { Connection } from 'mariadb';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class CrudUsuarioService {

    private conexion: Connection;
    constructor(private readonly dbConexionServicio: DatabaseService) { }

    
}
