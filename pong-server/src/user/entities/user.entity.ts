import { Match } from "src/match/entities/match.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @OneToMany(type => Match, match => match.player)
  matches: Match[];
}
