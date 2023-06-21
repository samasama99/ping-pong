import { Injectable } from '@nestjs/common';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from './entities/match.entity';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class MatchService {
  constructor(
    @InjectRepository(Match) private matchRepository: Repository<Match>,
    private userService: UserService
  ) { };

  async create(createMatchDto: CreateMatchDto) {
    console.log("dto", createMatchDto);
    const match = new Match();
    match.player1Id = createMatchDto.player1Id;
    match.player2Id = createMatchDto.player2Id;
    match.winnerId = createMatchDto.winnerId;
    match.player = await this.userService.findOne(createMatchDto.player1Id);
    this.matchRepository.save(match);
    match.player = await this.userService.findOne(createMatchDto.player2Id);
    this.matchRepository.save(match);
  }

  // async findOne(id: number) {
  //   return this.matchRepository
  //     .findOneOrFail({
  //       where: { id: id },
  //       relations: ['player1', 'player2'],
  //     });
  // }
}
