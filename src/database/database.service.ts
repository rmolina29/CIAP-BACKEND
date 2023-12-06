import { Injectable } from '@nestjs/common';
import { createConnection, Connection } from 'mariadb';

@Injectable()
export class DatabaseService {

    private connection: Connection

    async connectToDatabase(): Promise<any> {
        if (!this.connection) {
            this.connection = await createConnection({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_DATABASE,
                port: parseInt(process.env.DB_PORT)
            });
        }
    }


    getConnection(): Connection {
        return this.connection;
    }

    async closeConnection(){
        if(this.connection){
            await this.connection.end()
            this.connection = null;
        }
    }


}


