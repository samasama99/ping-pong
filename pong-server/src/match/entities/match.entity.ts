import { User } from "src/user/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type => User, user => user.matches)
  player: User;

  @Column()
  player1Id: number;

  @Column()
  player2Id: number;

  @Column()
  winnerId: number;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  date: Date;
}
