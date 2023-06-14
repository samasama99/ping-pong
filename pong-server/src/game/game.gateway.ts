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
  readonly gameWidth = 1232;
  readonly gameHeight = 685;
  readonly ballSize = 18 / 2;
  readonly paddleWidth = 11;
  readonly paddleHeight = 118;
  // readonly paddle1CornerRadius = 23;

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

    const newStart = this.getNewStart();
    const ballPosition = newStart.position;
    this.games[gameId].velocity = newStart.velocity;

    const ball = Matter.Bodies.circle(this.gameWidth / 2, this.gameHeight / 2, this.ballSize);

    Matter.Body.setPosition(ball, ballPosition);
    Matter.Body.setVelocity(ball, this.games[gameId].velocity);

    const paddle1_position = { x: 27, y: this.gameHeight / 2 };
    const paddle2_position = { x: this.gameWidth - 27, y: this.gameHeight / 2 };
    // const paddle1Vertices = Matter.Vertices.fromPath('0 0 0 118 7 118 7 0', null);
    // const paddle2Vertices = Matter.Vertices.fromPath('0 0 0 118 -7 118 -7 0', null);
    // const paddle1 = Matter.Bodies.fromVertices(paddle1_position.x, paddle1_position.y, [paddle1Vertices], {
    //   isStatic: true,
    // });

    // const paddle2 = Matter.Bodies.fromVertices(paddle2_position.x, paddle2_position.y, [paddle2Vertices], {
    //   isStatic: true
    // });
    const paddle1 = Matter.Bodies.rectangle(paddle1_position.x, paddle1_position.y, this.paddleWidth, this.paddleHeight, {
      isStatic: true
    });

    const paddle2 = Matter.Bodies.rectangle(paddle2_position.x, paddle2_position.y, this.paddleWidth, this.paddleHeight, {
      isStatic: true
    });

    const boundsTop = Matter.Bodies.rectangle(this.gameWidth / 2, 5, this.gameWidth, 10, { isStatic: true });
    const boundsBottom = Matter.Bodies.rectangle(this.gameWidth / 2, this.gameHeight - 5, this.gameWidth, 10, { isStatic: true });
    Matter.World.add(newGameInstance.world, [paddle1, paddle2, ball, boundsTop, boundsBottom]);

    ////

    // // Calculate the rounded corner vertices
    // const topLeft = { x: -this.paddleWidth / 2, y: -this.paddleHeight / 2 };
    // const topRight = { x: this.paddleWidth / 2, y: -this.paddleHeight / 2 };
    // const bottomRight = { x: this.paddleWidth / 2, y: this.paddleHeight / 2 };
    // const bottomLeft = { x: -this.paddleWidth / 2, y: this.paddleHeight / 2 };

    // // Modify the vertices to create rounded corners
    // paddle1.vertices[0].x = topLeft.x + this.paddle1CornerRadius;
    // paddle1.vertices[0].y = topLeft.y + this.paddle1CornerRadius;
    // paddle1.vertices[1].x = topRight.x - this.paddle1CornerRadius;
    // paddle1.vertices[1].y = topRight.y + this.paddle1CornerRadius;
    // paddle1.vertices[2].x = bottomRight.x - this.paddle1CornerRadius;
    // paddle1.vertices[2].y = bottomRight.y - this.paddle1CornerRadius;
    // paddle1.vertices[3].x = bottomLeft.x + this.paddle1CornerRadius;
    // paddle1.vertices[3].y = bottomLeft.y - this.paddle1CornerRadius;
    // paddle2.vertices[0].x = topLeft.x + this.paddle1CornerRadius;
    // paddle2.vertices[0].y = topLeft.y + this.paddle1CornerRadius;
    // paddle2.vertices[1].x = topRight.x - this.paddle1CornerRadius;
    // paddle2.vertices[1].y = topRight.y + this.paddle1CornerRadius;
    // paddle2.vertices[2].x = bottomRight.x - this.paddle1CornerRadius;
    // paddle2.vertices[2].y = bottomRight.y - this.paddle1CornerRadius;
    // paddle2.vertices[3].x = bottomLeft.x + this.paddle1CornerRadius;
    // paddle2.vertices[3].y = bottomLeft.y - this.paddle1CornerRadius;
    // /////

    player1.on('sendMyPaddleState', (state) => {
      const position = JSON.parse(state);
      Matter.Body.setPosition(paddle1, position);
    })

    player2.on('sendMyPaddleState', (state) => {
      const position = JSON.parse(state);
      Matter.Body.setPosition(paddle2, position);
    })

    player1.on('disconnect', () => {
      player2.emit('changeState', JSON.stringify({ gameState: 'Pause' }))
      Matter.World.clear(newGameInstance.world, false);
      Matter.Engine.clear(newGameInstance.engine);
      Matter.Render.stop(newGameInstance.engine.render);
      // Matter.Runner.stop(runner);
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

      Matter.Runner.run(newGameInstance.engine);

      Matter.Events.on(newGameInstance.engine, 'collisionStart', (event: Matter.IEventCollision<Matter.Engine>) => {
        event.pairs.forEach((pair) => {
          const bodyA = pair.bodyA;
          const bodyB = pair.bodyB;

          if (bodyA === ball && (bodyB === boundsTop || bodyB === boundsBottom)) {
            console.log("collision with bounds :")
            this.games[gameId].velocity.y *= -1;
            Matter.Body.setVelocity(ball, this.games[gameId].velocity);
          } else {
            console.log("collision with paddle :")
            this.games[gameId].velocity.x *= -1;
            Matter.Body.setVelocity(ball, this.games[gameId].velocity);
          }
          console.log(bodyA.area)
          console.log(bodyB.area)
        });
      })


      Matter.Events.on(newGameInstance.engine, 'beforeUpdate', () => {
        if (ball.position.x < -25 || ball.position.x > this.gameWidth + 25) {
          const newStart = this.getNewStart();
          Matter.Body.setPosition(ball, newStart.position);
          this.games[gameId].velocity = newStart.velocity;
        }
        Matter.Body.setVelocity(ball, this.games[gameId].velocity);
        player1.emit('updateOpponentPaddle', JSON.stringify({ x: paddle2.position.x, y: paddle2.position.y }));
        player2.emit('updateOpponentPaddle', JSON.stringify({ x: paddle1.position.x, y: paddle1.position.y }));
        player1.emit('updateBallState', JSON.stringify({
          x: ball.position.x,
          y: ball.position.y,
        }));
        player2.emit('updateBallState', JSON.stringify({
          x: ball.position.x,
          y: ball.position.y,
        }));
      });

      // Matter.Events.on(newGameInstance.engine, 'afterUpdate', () => {
      //   // console.log(paddle1.position)
      // });


    };


    console.log("Starting Game", { gameId });
  }


  private getNewStart() {
    const angle = Math.random() * 50 - 25; // Random angle between -25 and 25 degrees

    const angleRad = this.degreesToRadians(angle);

    const directionX = Math.cos(angleRad);
    const directionY = Math.sin(angleRad);

    const velocityMagnitude = this.getRandomNumberRange(10, 15); // Random velocity magnitude between 10 and 15

    const velocity = {
      x: directionX * velocityMagnitude,
      y: directionY * velocityMagnitude
    };

    const position = {
      x: this.gameWidth / 2,
      y: this.getRandomNumberRange(0, this.gameHeight)
    };

    return { position, velocity };
  }

  private degreesToRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  private getRandomNumberRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
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

