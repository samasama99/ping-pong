import { User } from "src/user/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type => User, user => user.matches)
  player1: User;

  @ManyToOne(type => User)
  player2: User;

  @Column({ type: 'smallint' })
  winner: number;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  date: Date;
}
