import { WebSocketGateway, SubscribeMessage } from '@nestjs/websockets';
import { Socket } from 'socket.io';
// import { Engine, World, Bodies } from 'matter-js';
import * as Matter from 'matter-js'

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
  private games: { [gameId: number]: { player1: Socket, player2: Socket, player1Ready: boolean, player2Ready: boolean, gameInstance: GameInstance, velocity: { x: number, y: number } } } = {};

  // const activeGameInstances: GameInstance[] = [];

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
    const newGameInstance = new GameInstance();
    this.games[gameId] = Object.assign({}, { player1, player2, player1Ready: false, player2Ready: false, gameInstance: newGameInstance, velocity: { x: 0, y: 0 } });
    // this.games[gameId] = { };

    // const ballCategory = 0x0001;
    // const paddleCategory = 0x0002;

    const ballSize = 30;
    const newStart = this.getNewStart();
    const ballPosition = newStart.position;
    this.games[gameId].velocity = newStart.velocity;

    const ball = Matter.Bodies.rectangle(1300 / 2, 690 / 2, ballSize, ballSize, {
      // collisionFilter: {
      //   category: ballCategory,
      //   mask: paddleCategory,
      // },
      // velocity: velocity, // Set initial velocity directly during body creation
    });

    Matter.Body.setPosition(ball, ballPosition);
    Matter.Body.setVelocity(ball, this.games[gameId].velocity);
    // console.log({ "velocity": ball.velocity });
    // console.log({ "position": ball.position });
    // Matter.World.add(newGameInstance.world, ball);

    const width = 30;
    const height = 150;
    const paddle1_position = { x: 50.5, y: 690 / 2 };
    const paddle2_position = { x: 1195.5, y: 690 / 2 };
    const paddle1 = Matter.Bodies.rectangle(paddle1_position.x, paddle1_position.y, width, height, {
      isStatic: true
      // collisionFilter: {
      //   category: paddleCategory,
      //   mask: ballCategory,
      // },
    });

    const paddle2 = Matter.Bodies.rectangle(paddle2_position.x, paddle2_position.y, width, height, {
      isStatic: true
      // collisionFilter: {
      //   category: paddleCategory,
      //   mask: ballCategory,
      // },
    });
    const boundsTop = Matter.Bodies.rectangle(1300 / 2, -10, 1300, 20, { isStatic: true });
    const boundsBottom = Matter.Bodies.rectangle(1300 / 2, 970, 1300, 20, { isStatic: true });
    Matter.World.add(newGameInstance.world, [paddle1, paddle2, ball, boundsTop, boundsBottom]);

    ////

    // ball.restitution = 1; // Set high restitution for bouncing
    // paddle1.restitution = 0.5;
    // paddle2.restitution = 0.5;
    // ball.friction = 0; // No friction for the ball
    // paddle1.friction = 0.2;
    // paddle2.friction = 0.2;
    // ball.density = 0.01;
    // paddle1.density = 0.1;
    // paddle2.density = 0.1;
    /////

    player1.on('sendMyPaddleState', (state) => {
      const paddle = JSON.parse(state);
      const paddle1_position = { x: 50.5, y: paddle.myPaddle };
      Matter.Body.setPosition(paddle1, paddle1_position);
      player2.emit('updateOpponentPaddle', state);
    })

    player2.on('sendMyPaddleState', (state) => {
      const paddle = JSON.parse(state);
      const paddle2_position = { x: 1195.5, y: paddle.myPaddle };
      Matter.Body.setPosition(paddle2, paddle2_position);
      player1.emit('updateOpponentPaddle', state);
    })

    player1.on('disconnect', () => {
      player2.emit('changeState', JSON.stringify({ gameState: 'Pause' }))
    });

    player2.on('disconnect', () => {
      player1.emit('changeState', JSON.stringify({ gameState: 'Pause' }))
    });

    player1.emit('changeState', JSON.stringify({ gameState: 'Playing', playerNumber: "PlayerOne" }));
    player2.emit('changeState', JSON.stringify({ gameState: 'Playing', playerNumber: "PlayerTwo" }));



    // const ballIndex = newGameInstance.world.bodies.indexOf(ball);
    // const paddle1Index = newGameInstance.world.bodies.indexOf(paddle1);
    // const paddle2Index = newGameInstance.world.bodies.indexOf(paddle2);
    // console.log(ballIndex, paddle1Index, paddle2Index)
    // console.log('Bodies:', newGameInstance.world.bodies);
    // console.log(newGameInstance.engine)
    // console.log(newGameInstance.world);


    player1.on('playerIsReady', () => {
      console.log('player1 is ready');
      this.games[gameId].player1Ready = true;

      if (this.games[gameId].player2Ready) {
        startGame();
      } else {
        player1.emit('waitingForOpponent');
      }
    });

    player2.on('playerIsReady', () => {
      console.log('player2 is ready');
      this.games[gameId].player2Ready = true;

      if (this.games[gameId].player1Ready) {
        startGame();
      } else {
        player2.emit('waitingForOpponent');
      }
    });

    const startGame = () => {
      console.log("Starting The Engine")
      Matter.Events.on(newGameInstance.engine, 'collisionStart', (event: Matter.IEventCollision<Matter.Engine>) => {
        event.pairs.forEach((pair) => {
          const bodyA = pair.bodyA;
          const bodyB = pair.bodyB;

          if (bodyA === ball && (bodyB === boundsTop || bodyB === boundsBottom)) {
            this.games[gameId].velocity.y *= -1;
            Matter.Body.setVelocity(ball, this.games[gameId].velocity);
          } else {
            this.games[gameId].velocity.x *= -1;
            Matter.Body.setVelocity(ball, this.games[gameId].velocity);
          }
        });
      })
      setInterval(() => {
        if (ball.position.x < -50 || ball.position.x > 1350) {
          const newStart = this.getNewStart();
          Matter.Body.setPosition(ball, newStart.position);
          this.games[gameId].velocity = newStart.velocity;
        }
        Matter.Body.setVelocity(ball, this.games[gameId].velocity);
        // ball.velocity.x = this.games[gameId].velocity.x;
        // ball.velocity.y = this.games[gameId].velocity.y;
        player1.emit('updateBallState', JSON.stringify({
          x: ball.position.x, y: ball.position.y
        }));
        player2.emit('updateBallState', JSON.stringify({
          x: ball.position.x, y: ball.position.y
        }));
      }, 15);
      Matter.Runner.run(newGameInstance.engine);
    };


    console.log("Starting Game", { gameId });
  }

  private getNewStart() {
    // console.log("resetBall");
    const sign = Math.random() < 0.5 ? -1 : 1;
    const angle = Math.floor(Math.random() * (sign * 55 - sign * 25 + 1) + sign * 25);

    const angleRad = this.degreesToRadians(angle);

    const directionX = Math.cos(angleRad);
    const directionY = Math.sin(angleRad);

    const length = Math.sqrt(directionX ** 2 + directionY ** 2);
    const normalizedDirectionX = directionX / length;
    const normalizedDirectionY = directionY / length;

    const velocity = { x: normalizedDirectionX * 12, y: normalizedDirectionY * 12 };

    const position = {
      x: 1300 / 2, y: this.getRandomNumber(0, 690)
      // x: 1300 / 2, y: this.getRandomNumber(100, 690 - 100)
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

// class Player {
//   playerId: number;
//   socket: Socket;
// }
class GameInstance {
  public engine: Matter.Engine;
  public world: Matter.World;

  constructor() {
    // Create a new Matter.js engine and world for this game instance
    this.engine = Matter.Engine.create();
    this.world = this.engine.world;

    this.world.gravity.x = 0;
    this.world.gravity.y = 0;
    // Configure the physics world if needed
    // For example, set gravity:
    // this.world.gravity.y = 1;
  }
}

