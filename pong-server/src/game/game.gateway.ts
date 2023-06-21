import { WebSocketGateway, SubscribeMessage, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { GameService } from './game.service';



@WebSocketGateway(3001, {
  cors: {
    origin: '*',
    credentials: true,
  }
})
export class GameGateway
  implements OnGatewayDisconnect {

  constructor(private gameService: GameService) { }

  handleDisconnect(socket: any) {
    this.gameService.handleDisconnect(socket);
  }

  @SubscribeMessage('logIn')
  logIn(socket: Socket, payload: string) {
    this.gameService.logIn(socket, payload);
  }


  @SubscribeMessage('createGame')
  create(socket: Socket, payload) {
    this.gameService.createGame(socket, payload);
  }
}


