import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from 'src/match/entities/match.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Match])],
  controllers: [UserController],
  providers: [UserService],
  exports: [TypeOrmModule.forFeature([User, Match]), UserService],
})
export class UserModule { }
