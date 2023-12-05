import { Module } from '@nestjs/common';
import { LoginController } from './login.controller';
import { LoginService } from './login.service';
import { DatabaseService } from 'src/database/database.service'; 

@Module({
  controllers: [LoginController],
  providers: [LoginService,DatabaseService]
})
export class LoginModule {}
