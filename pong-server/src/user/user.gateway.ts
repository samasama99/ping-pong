import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';

@WebSocketGateway(3002, {
  cors: {
    origin: '*',
    credentials: true,
  }
})
export class UserGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  // @WebSocketServer() server: Server;

  afterInit(server: any) {
    console.log('WebSocket server initialized');
  }

  handleConnection(client: any, request: any) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: any) {
    console.log(`Client disconnected: ${client.id}`);
  }

}
