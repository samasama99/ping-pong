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
    origin: '*',
    // origin: 'http://e2r9p10.1337.ma:4200',
    credentials: true,
  }
}
)
export class GameGateway {
  // @WebSocketServer()
  // private server: Server;
  private queue: Array<Socket> = [];
  private games: Map<number, { player1: Socket, player2: Socket, player1Ready: boolean, player2Ready: boolean }> = new Map();;

  constructor() { }

  @SubscribeMessage('createGame')
  create(socket: Socket) {
    console.log("create game");
    if (this.queue.length == 0) {
      this.queue.push(socket)
      socket.emit('changeState', JSON.stringify({ gameState: 'Queue' }));
      return;
    }

    let player1: Socket = this.queue.pop()
    let player2: Socket = socket;
    const gameId = Date.now();
    this.games[gameId] = { player1, player2, player1Ready: false, player2Ready: false };


    player1.on('sendMyPaddleState', (state) => {
      player2.emit('updateOpponentPaddle', state);
    })

    player2.on('sendMyPaddleState', (state) => {
      player1.emit('updateOpponentPaddle', state);
    })

    player1.on('disconnect', () => {
      player2.emit('changeState', JSON.stringify('pause'))
    });

    player2.on('disconnect', () => {
      player1.emit('changeState', JSON.stringify('pause'))
    });

    player1.emit('changeState', JSON.stringify({ gameState: 'Playing', playerNumber: "PlayerOne" }));
    player2.emit('changeState', JSON.stringify({ gameState: 'Playing', playerNumber: "PlayerTwo" }));


    player1.on('playerIsReady', () => {
      console.log('player 1 is ready');
      this.games[gameId].player1Ready = true;
      if (this.games[gameId].player2Ready) {
        player1.emit('updateBallState', JSON.stringify({
          position: { x: 1300 / 2, y: 960 / 2 },
          velocity: { x: 500, y: 0 },
        }));
        player2.emit('updateBallState', JSON.stringify({
          position: { x: 1300 / 2, y: 960 / 2 },
          velocity: { x: 500, y: 0 },
        }));
      }
    });

    player2.on('playerIsReady', () => {
      console.log('player 2 is ready');
      this.games[gameId].player2Ready = true;
      if (this.games[gameId].player1Ready) {
        player1.emit('updateBallState', JSON.stringify({
          position: { x: 1300 / 2, y: 960 / 2 },
          velocity: { x: 500, y: 0 },
        }));
        player2.emit('updateBallState', JSON.stringify({
          position: { x: 1300 / 2, y: 960 / 2 },
          velocity: { x: 500, y: 0 },
        }));
      }
    });

    player1.on('sendBallState', (state) => {
      const data: { position: { x: number, y: number }, velocity: { x: number, y: number } } = JSON.parse(state);
      console.log(state);
      console.log(data);
      if (data.position.x < -50 || data.position.x > 1350) {

        const newStart = this.getNewStart();
        player1.emit('updateBallState', JSON.stringify(newStart));
        player2.emit('updateBallState', JSON.stringify(newStart));
      } else {

        player1.emit('updateBallState', JSON.stringify({
          position: { x: data.position.x, y: data.position.y },
          velocity: { x: data.velocity.x, y: data.velocity.y },
        }));
        player2.emit('updateBallState', JSON.stringify({
          position: { x: data.position.x, y: data.position.y },
          velocity: { x: data.velocity.x, y: data.velocity.y },
        }));
      }
    });
    // player2.on('sendBallState', (state) => console.log("player 2", JSON.parse(state)));

    console.log("Starting Game", { gameId });
  }
  private getNewStart() {
    console.log("resetBall");
    const sign = Math.random() < 0.5 ? -1 : 1;
    const angle = Math.floor(Math.random() * (sign * 55 - sign * 25 + 1) + sign * 25);

    const angleRad = this.degreesToRadians(angle);

    const directionX = Math.cos(angleRad);
    const directionY = Math.sin(angleRad);

    const length = Math.sqrt(directionX ** 2 + directionY ** 2);
    const normalizedDirectionX = directionX / length;
    const normalizedDirectionY = directionY / length;

    const velocity = { x: normalizedDirectionX * 650, y: normalizedDirectionY * 650 };

    const position = {
      x: 1300 / 2, y: this.getRandomNumber(100, 690 - 100)
    };

    return { position, velocity };
  }

  private degreesToRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  private getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}
