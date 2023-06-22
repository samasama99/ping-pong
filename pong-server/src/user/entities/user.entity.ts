import { Match } from "src/match/entities/match.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @OneToMany(() => Match, match => match.player1)
  matchesAsPlayer1: Match[];

  @OneToMany(() => Match, match => match.player2)
  matchesAsPlayer2: Match[];

  @OneToMany(() => Match, match => match.winner)
  wonMatches: Match[];
}

