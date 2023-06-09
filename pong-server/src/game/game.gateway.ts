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
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server: Server;
  private queue: Array<Socket> = [];
  private games: { player1: Socket, player2: Socket }[] = [];

  constructor(private readonly gameService: GameService) { }

  handleDisconnect(player: Socket) {
    console.log("handleDisconnect")
    // console.log(player.playerId, "quit");
    // this.queue = this.queue.filter(q => q.playerId !== player.playerId);

    // const gameIndex = this.games.findIndex(
    //   q => q.player1.playerId === player.playerId || q.player2.playerId === player.playerId
    // );

    // if (gameIndex !== -1) {
    //   const { player1, player2 } = this.games[gameIndex];

    //   if (player1.playerId === player.playerId) {
    //     console.log(player2.playerId, "is pending");
    //     player2.socket.emit('changeState', 'pending');
    //   } else {
    //     console.log(player1.playerId, "is pending");
    //     player1.socket.emit('changeState', 'pending');
    //   }

    //   this.games.splice(gameIndex, 1);
    // }

  }

  handleConnection(client: Socket) {
    console.log("handleConnection");
  }

  // @SubscribeMessage('msg')
  // handleMsg(socket: Socket, msg: string) {
  //   console.log(socket, msg)
  // }

  @SubscribeMessage('createGame')
  create(socket: Socket) {
    console.log("create game");
    if (this.queue.length == 0) {
      this.queue.push(socket)
      socket.emit('changeState', JSON.stringify('in queue'));
      console.log("first player in")
      return;
    }
    let player1socket: Socket = this.queue.pop()
    this.games.push({ player1: player1socket, player2: socket });
    let player1 = { gameId: Date.now(), state: 'player1' };
    let player2 = { gameId: player1.gameId, state: 'player2' };



    socket.on('disconnect', () => {
      console.log(player1, player2);
    });
    player1socket.on('disconnect', () => {
      console.log(player1, player2);
    });
    socket.on('close', () => {
      console.log(player1, player2);
    });
    socket.on('error', () => {
      console.log(player1, player2);
    });
    player1socket.on('close', () => {
      console.log(player1, player2);
    });
    player1socket.on('error', () => {
      console.log(player1, player2);
    });

    player1socket.emit('changeState', JSON.stringify(player1));
    socket.emit('changeState', JSON.stringify(player2));
    console.log("second player in")
  }

  // @SubscribeMessage('tabClosed')
  // handleTabClosed(socket: Socket, state: string): void {
  //   // Handle the tab closure event
  //   console.log('Tab closed:', state);
  //   console.log('Tab closed:', JSON.parse(state));
  //   // Perform any necessary operations
  //   // ...
  // }

}
