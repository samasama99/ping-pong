import { Module } from '@nestjs/common';
import { MatchService } from './match.service';
import { MatchController } from './match.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Match } from './entities/match.entity';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [UserModule, TypeOrmModule.forFeature([Match])],
  controllers: [MatchController],
  providers: [MatchService],
  exports: [TypeOrmModule.forFeature([Match]), MatchService],
})
export class MatchModule { }
