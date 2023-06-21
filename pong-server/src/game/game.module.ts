import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { UserModule } from '../user/user.module';
import { MatchModule } from 'src/match/match.module';

@Module({
  imports: [UserModule, MatchModule],
  providers: [GameGateway, GameService]
})
export class GameModule { }
