import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, OnGatewayDisconnect } from '@nestjs/websockets';
import { GameService } from './game.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { OnGatewayConnection, OnGatewayInit } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Socket } from 'dgram';

import {
  WsResponse,
} from '@nestjs/websockets';
import { from, Observable, queue } from 'rxjs';
import { map } from 'rxjs/operators';
import { query } from 'express';
import { json } from 'stream/consumers';

// class Player {
//   playerId: number;
//   socket: Socket;
// }


@WebSocketGateway(3001, {
  cors: {
    origin: 'http://localhost:4200',
    credentials: true,
  }
}
)
export class GameGateway {
  // @WebSocketServer()
  // private server: Server;
  private queue: Array<Socket> = [];
  private games: Map<number, { player1: Socket, player2: Socket }> = new Map<number, { player1: Socket, player2: Socket }>();;

  constructor() { }

  @SubscribeMessage('createGame')
  create(socket: Socket) {
    console.log("create game");
    if (this.queue.length == 0) {
      this.queue.push(socket)
      socket.emit('changeState', JSON.stringify('in queue'));
      return;
    }

    let player1: Socket = this.queue.pop()
    let player2: Socket = socket;
    const gameId = Date.now();

    player1.on('disconnect', () => {
      player2.emit('changeState', JSON.stringify('pending'))
    });

    player1.on('updatePlayerVelocity', (state) => {
      console.log(state)
    });

    player1.on('updateBallState', (state) => {
      console.log(state)
      player2.emit('updateBallStateEvent', state);
    });

    player2.on('disconnect', () => {
      player1.emit('changeState', JSON.stringify('pending'))
    });

    this.games[gameId] = { player1, player2 };

    player1.emit('changeState', JSON.stringify({ gameId, state: 'player1' }));
    player2.emit('changeState', JSON.stringify({ gameId, state: 'player2' }));
    console.log("Starting Game", { gameId });
  }
}
