import { Injectable } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { UserService } from './user.service';

@WebSocketGateway(3002, {
  cors: {
    origin: '*',
    credentials: true,
  }
})
export class UserGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  // @WebSocketServer() server: Server;
  constructor(private userService: UserService) { }

  afterInit(server: any) {
    console.log('WebSocket server initialized');
  }

  handleConnection(client: any, request: any) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(socket: any) {
    console.log(`Client disconnected: ${socket.id}`);
    this.userService.handleDisconnect(socket);
  }

  @SubscribeMessage('logIn')
  logIn(socket: Socket, payload: string) {
    this.userService.logIn(socket, payload);
  }

}
