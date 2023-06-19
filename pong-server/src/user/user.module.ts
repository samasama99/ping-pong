import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from 'src/match/entities/match.entity';
import { UserGateway } from './user.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([User, Match])],
  controllers: [UserController],
  providers: [UserGateway, UserService],
  exports: [TypeOrmModule.forFeature([User])],
})
export class UserModule { }
