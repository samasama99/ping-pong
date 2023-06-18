import { Injectable } from '@nestjs/common';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from './entities/match.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class MatchService {
  constructor(
    @InjectRepository(Match) private matchRepository: Repository<Match>,
    @InjectRepository(User) private userRepository: Repository<User>
  ) { };

  async create(createMatchDto: CreateMatchDto) {
    const match = this.matchRepository.create({ ...createMatchDto });
    return this.matchRepository.save(match);
  }

  async findOne(id: number) {
    return this.matchRepository
      .findOneOrFail({
        where: { id: id },
        relations: ['player1', 'player2'],
      });
  }
}
