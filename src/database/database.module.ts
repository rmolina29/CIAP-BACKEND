import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { createConnection } from 'mariadb';

@Module({
  providers: [DatabaseService]
})
export class DatabaseModule {
    static forRoot() {
        const connection = createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
          });
    
        return {
          module: DatabaseModule,
          providers: [
            {
              provide: 'DATABASE_CONNECTION',
              useValue: connection,
            },
          ],
          exports: ['DATABASE_CONNECTION'],
        };
      }
}
