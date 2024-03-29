import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { GameInstance } from './GameInstance';
import { UserService } from 'src/user/user.service';
import { MatchService } from 'src/match/match.service';
import { sampleSize } from 'lodash';

export const GAMEWIDTH = 1232;
export const GAMEHEIGHT = 685;
export const BALLRADIUS = 10;
export const PADDLEWIDTH = 12;
export const PADDLEHEIGHT = 119;
export const PADDLE1POSITION = { x: 27, y: GAMEHEIGHT / 2 };
export const PADDLE2POSITION = { x: GAMEWIDTH - 27, y: GAMEHEIGHT / 2 };
export const MAXANGLE = Math.PI / 4;
export const INITALBALLSPEED = 10;
export const DAMPINGFACTOR = 0.99;

export enum PlayerNumber { One, Two };
export enum Color { White = 'White', Blue = 'Blue', Green = 'Green' };

@Injectable()
export class GameService {
  private queue: Array<{ id: number, socket: Socket }> = [];
  private currentPlayers = new Array<{ id: number, socket: Socket }>();
  private activeGameInstances: { [key: string]: GameInstance } = {};

  constructor(private userService: UserService, private matchService: MatchService) {
    setInterval(() => {
      // console.log("queue :", this.queue.map(_ => _.id));
      // console.log("active game instances :", Object.keys(this.activeGameInstances));
      // console.log("current players :", this.currentPlayers.map(_ => _.id));
      Object.entries(this.activeGameInstances).forEach(([key, value]) => {
        if (value.inactive) {
          const player1Id: number = parseInt(key.split(',')[0]);
          const player2Id: number = parseInt(key.split(',')[1]);
          this.currentPlayers = this.currentPlayers.filter(player => player.id !== player1Id && player.id !== player2Id);
          this.matchService.create(
            {
              player1Id,
              player2Id,
              winnerId: value.score.player1 > value.score.player2 ? player1Id : player2Id,
            })
        }
      });
      this.activeGameInstances = Object.entries(this.activeGameInstances)
        .filter(([_, gameInstance]) => !gameInstance.inactive)
        .reduce((result, [key, value]) => {
          result[key] = value;
          return result;
        }, {});

      if (this.queue.length >= 2) {
        let [player1, player2]: { id: number, socket: Socket }[] = sampleSize(this.queue, 2);
        player1.socket.emit('startTheGame')
        player2.socket.emit('startTheGame')
        this.queue = this.queue.filter(player => player.id !== player1.id && player.id !== player2.id);
        this.activeGameInstances[`${player1.id},${player2.id}`] = new GameInstance(player1.socket, player2.socket);
        this.currentPlayers.push(player1);
        this.currentPlayers.push(player2);
      }
      // console.log("after", process.memoryUsage())
    }, 1000);
  }

  createGame(socket: Socket, payload: any) {
    const { id1, id2 } = JSON.parse(payload);
    console.log({ id1, id2 });
    if (this.currentPlayers.find(player => player.id === id1))
      return;
    if (id2 && this.currentPlayers.find(player => player.id === id2))
      return;
    if (!id2) {
      this.queue.push({ id: id1, socket })
      socket.emit('changeState', JSON.stringify({ gameState: 'Queue' }));
    } else {
      // console.log("online list", this.userService.onlineUsers)
      const invitedUser = this.userService.onlineUsers.find(_ => _.id === id2);
      if (invitedUser) {
        invitedUser.socket.emit('invite', id1);
        invitedUser.socket.once('inviteResponse', (response) => {
          console.log("res", response);
          if (response === true) {
            const player1 = this.userService.onlineUsers.find(_ => _.id === id1);
            const player2 = this.userService.onlineUsers.find(_ => _.id === id2);
            player2.socket.emit('startTheGame')
            player1.socket.emit('startTheGame')
            this.activeGameInstances[`${player1.id},${player2.id}`] = new GameInstance(player1.socket, player2.socket);
            this.currentPlayers.push(player1);
            this.currentPlayers.push(player2);
          }
        })
        console.log('user is online', invitedUser.id);
      } else {
        console.log('user is offline', id2);
      }
    }
  }

  logIn(socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>, payload: string) {
    this.userService.logIn(socket, payload);
  }

  handleDisconnect(socket: any) {
    this.userService.handleDisconnect(socket);
    socket.on('disconnect', () => {
      this.queue = this.queue.filter(player => player.socket !== socket);
      socket.removeAllListeners('disconnect');
    });
  }

}
