import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer } from '@nestjs/websockets';
import { GameService } from './game.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { OnGatewayConnection, OnGatewayInit } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ namespace: 'game' })
export class GameGateway implements OnGatewayConnection, OnGatewayInit {
  // @WebSocketServer()
  // private server: Server;

  // onModuleInit() {
  //   this.server.on('connection', (socket) => {
  //     console.log(socket.id)
  //   })
  // }

  constructor(private readonly gameService: GameService) { }
  afterInit(server: any) {
    console.log("afterInit")
  }
  handleConnection(client: any, ...args: any[]) {
    console.log("handleConnection")
  }

  @SubscribeMessage('createGame')
  create(@MessageBody() createGameDto: CreateGameDto) {
    console.log("client connected");
    return this.gameService.create(createGameDto);
  }

  @SubscribeMessage('findAllGame')
  findAll() {
    return this.gameService.findAll();
  }

  @SubscribeMessage('findOneGame')
  findOne(@MessageBody() id: number) {
    return this.gameService.findOne(id);
  }

  @SubscribeMessage('updateGame')
  update(@MessageBody() updateGameDto: UpdateGameDto) {
    return this.gameService.update(updateGameDto.id, updateGameDto);
  }

  @SubscribeMessage('removeGame')
  remove(@MessageBody() id: number) {
    return this.gameService.remove(id);
  }
}
