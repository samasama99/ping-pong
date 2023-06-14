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
  private games: { [gameId: number]: { player1: Socket, player2: Socket, player1Ready: boolean, player2Ready: boolean, gameInstance: GameInstance, velocity: { x: number, y: number }, score: { player1: number, player2: number } } } = {};
  readonly gameWidth = 1232;
  readonly gameHeight = 685;
  readonly ballSize = 18 / 2;
  readonly paddleWidth = 5;
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
    this.games[gameId] = Object.assign({}, { player1, player2, player1Ready: false, player2Ready: false, gameInstance: newGameInstance, velocity: { x: 0, y: 0 }, score: { player1: 0, player2: 0 } });
    // this.games[gameId] = { };

    // const ballCategory = 0x0001;
    // const paddleCategory = 0x0002;

    const newStart = this.getNewStart(this.gameWidth, this.gameHeight);
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
      // Matter.World.clear(newGameInstance.world, false);
      // Matter.Engine.clear(newGameInstance.engine);
      // Matter.Render.stop(newGameInstance.engine.render);
      // Matter.Runner.stop(runner);
    });

    player2.on('disconnect', () => {
      player1.emit('changeState', JSON.stringify({ gameState: 'Pause' }))
    });

    player1.emit('changeState', JSON.stringify({ gameState: 'Playing', playerNumber: "PlayerOne" }));
    player2.emit('changeState', JSON.stringify({ gameState: 'Playing', playerNumber: "PlayerTwo" }));


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

          if (bodyA === ball && bodyB === boundsTop) {
            // Collision with top bound
            this.handleCollisionWithBounds(ball, boundsTop, gameId);
          } else if (bodyA === ball && bodyB === boundsBottom) {
            // Collision with bottom bound
            this.handleCollisionWithBounds(ball, boundsBottom, gameId);
          } else if (bodyA === ball && bodyB === paddle1) {
            // Collision with paddle 1
            this.handleCollisionWithPaddle(ball, paddle1, gameId);
          } else if (bodyA === paddle1 && bodyB === ball) {
            // Collision with paddle 1 (reversed order)
            this.handleCollisionWithPaddle(ball, paddle1, gameId);
          } else if (bodyA === ball && bodyB === paddle2) {
            // Collision with paddle 2
            this.handleCollisionWithPaddle(ball, paddle2, gameId);
          } else if (bodyA === paddle2 && bodyB === ball) {
            // Collision with paddle 2 (reversed order)
            this.handleCollisionWithPaddle(ball, paddle2, gameId);
          }
        });
      });


      Matter.Events.on(newGameInstance.engine, 'beforeUpdate', () => {
        if (ball.position.x < -25 || ball.position.x > this.gameWidth + 25) {
          if (ball.position.x < -25) {
            this.games[gameId].score.player2 += 1;
            player1.emit('UpdateScore', JSON.stringify(this.games[gameId].score))
            player2.emit('UpdateScore', JSON.stringify(this.games[gameId].score))
          }
          if (ball.position.x > this.gameWidth + 25) {
            this.games[gameId].score.player1 += 1;
            player1.emit('UpdateScore', JSON.stringify(this.games[gameId].score))
            player2.emit('UpdateScore', JSON.stringify(this.games[gameId].score))
          }
          const newStart = this.getNewStart(this.gameWidth, this.gameHeight);
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

    };


    console.log("Starting Game", { gameId });
  }

  private handleCollisionWithBounds(ball: Matter.Body, bound: Matter.Body, gameId) {
    // Reverse the ball's velocity along the collision axis (y-axis)
    this.games[gameId].velocity.y *= -1;
    Matter.Body.setVelocity(ball, this.games[gameId].velocity);

    // Adjust the ball's position to prevent it from penetrating the bound
    // const correction = (ball.position.y + this.ballSize / 2) - (bound.position.y - bound.bounds.max.y);
    // Matter.Body.translate(ball, { x: 0, y: correction });
  }

  private handleCollisionWithPaddle(ball: Matter.Body, paddle: Matter.Body, gameId) {
    // Reverse the ball's velocity along the collision axis (x-axis)
    this.games[gameId].velocity.x *= -1;
    Matter.Body.setVelocity(ball, this.games[gameId].velocity);

    // Adjust the ball's position to prevent it from penetrating the paddle
    // const correction = (ball.position.x + this.ballSize / 2) - (paddle.position.x - paddle.bounds.max.x);
    // Matter.Body.translate(ball, { x: correction, y: 0 });
  }


  private getNewStart(gameWidth, gameHeight) {
    const angle = Matter.Common.random(-75, -25) + Matter.Common.random(0, 1) * 100; // Random angle between -75 and -25, or between 25 and 75 degrees

    const angleRad = this.degreesToRadians(angle);

    const directionX = Math.cos(angleRad);
    const directionY = Math.sin(angleRad);

    const velocityMagnitude = this.getRandomNumberRange(10, 15); // Random velocity magnitude between 10 and 15

    const velocity = {
      x: directionX * velocityMagnitude,
      y: directionY * velocityMagnitude,
    };

    const position = {
      x: gameWidth / 2,
      y: this.getRandomNumberRange(0, gameHeight),
    };

    return { position, velocity };
  }

  private degreesToRadians(degrees) {
    return (degrees * Math.PI) / 180;
  }

  private getRandomNumberRange(min, max) {
    return Matter.Common.random(min, max);
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

// import { WebSocketGateway, SubscribeMessage } from '@nestjs/websockets';
// import { Socket } from 'socket.io';
// import * as Matter from 'matter-js';

// @WebSocketGateway(3001, {
//   cors: {
//     origin: '*',
//     credentials: true,
//   }
// })
// export class GameGateway {
//   private queue: Array<Socket> = [];
//   private games: { [gameId: number]: { player1: Socket, player2: Socket, player1Ready: boolean, player2Ready: boolean, gameInstance: GameInstance } } = {};
//   readonly gameWidth = 1232;
//   readonly gameHeight = 685;
//   readonly ballSize = 18 / 2;
//   readonly paddleWidth = 11;
//   readonly paddleHeight = 118;

//   constructor() { }

//   @SubscribeMessage('createGame')
//   create(socket: Socket) {
//     if (this.queue.length == 0) {
//       this.queue.push(socket);
//       socket.emit('changeState', JSON.stringify({ gameState: 'Queue' }));
//       return;
//     }

//     const player1: Socket = this.queue.pop();
//     const player2: Socket = socket;
//     const gameId = Date.now();
//     const newGameInstance = new GameInstance();
//     this.games[gameId] = {
//       player1,
//       player2,
//       player1Ready: false,
//       player2Ready: false,
//       gameInstance: newGameInstance,
//     };

//     const ball = Matter.Bodies.circle(this.gameWidth / 2, this.gameHeight / 2, this.ballSize);
//     const paddle1 = Matter.Bodies.rectangle(27, this.gameHeight / 2, this.paddleWidth, this.paddleHeight, {
//       isStatic: true,
//     });
//     const paddle2 = Matter.Bodies.rectangle(this.gameWidth - 27, this.gameHeight / 2, this.paddleWidth, this.paddleHeight, {
//       isStatic: true,
//     });
//     const boundsTop = Matter.Bodies.rectangle(this.gameWidth / 2, 5, this.gameWidth, 10, { isStatic: true });
//     const boundsBottom = Matter.Bodies.rectangle(this.gameWidth / 2, this.gameHeight - 5, this.gameWidth, 10, { isStatic: true });

//     Matter.World.add(newGameInstance.world, [paddle1, paddle2, ball, boundsTop, boundsBottom]);

//     player1.on('sendMyPaddleState', (state) => {
//       const position = JSON.parse(state);
//       Matter.Body.setPosition(paddle1, position);
//     });

//     player2.on('sendMyPaddleState', (state) => {
//       const position = JSON.parse(state);
//       Matter.Body.setPosition(paddle2, position);
//     });

//     player1.on('disconnect', () => {
//       player2.emit('changeState', JSON.stringify({ gameState: 'Pause' }));
//     });

//     player2.on('disconnect', () => {
//       player1.emit('changeState', JSON.stringify({ gameState: 'Pause' }));
//     });

//     player1.emit('changeState', JSON.stringify({ gameState: 'Playing', playerNumber: 'PlayerOne' }));
//     player2.emit('changeState', JSON.stringify({ gameState: 'Playing', playerNumber: 'PlayerTwo' }));

//     player1.on('playerIsReady', () => {
//       this.games[gameId].player1Ready = true;
//       if (this.games[gameId].player2Ready) {
//         startGame();
//       } else {
//         player1.emit('changeState', JSON.stringify({ gameState: 'Waiting' }));
//       }
//     });

//     player2.on('playerIsReady', () => {
//       this.games[gameId].player2Ready = true;
//       if (this.games[gameId].player1Ready) {
//         startGame();
//       } else {
//         player2.emit('changeState', JSON.stringify({ gameState: 'Waiting' }));
//       }
//     });
//     const startGame = () => {
//       newGameInstance.runner = Matter.Runner.create();
//       Matter.Runner.run(newGameInstance.runner, newGameInstance.engine);

//       const update = () => {
//         Matter.Engine.update(newGameInstance.engine, newGameInstance.delta);
//       };

//       setInterval(update, newGameInstance.delta);

//       Matter.Events.on(newGameInstance.engine, 'collisionStart', (event) => {
//         const pairs = event.pairs;
//         pairs.forEach((collision) => {
//           const { bodyA, bodyB } = collision;

//           if (bodyA === ball && bodyB === paddle1) {
//             Matter.Body.setVelocity(ball, { x: 5, y: -5 });
//           } else if (bodyA === ball && bodyB === paddle2) {
//             Matter.Body.setVelocity(ball, { x: -5, y: 5 });
//           } else if (bodyA === ball && (bodyB === boundsTop || bodyB === boundsBottom)) {
//             const ballVelocity = Matter.Vector.neg(ball.velocity);
//             Matter.Body.setVelocity(ball, ballVelocity);
//           }
//         });
//       });

//       Matter.Events.on(newGameInstance.engine, 'collisionActive', (event) => {
//         const pairs = event.pairs;
//         pairs.forEach((collision) => {
//           const { bodyA, bodyB } = collision;

//           if (bodyA === ball && (bodyB === paddle1 || bodyB === paddle2)) {
//             // Bounce the ball off the paddle
//             const ballVelocity = Matter.Vector.neg(ball.velocity);
//             Matter.Body.setVelocity(ball, ballVelocity);
//           }
//         });
//       });

//       Matter.Events.on(newGameInstance.engine, 'beforeUpdate', () => {
//         if (ball.position.x < -25 || ball.position.x > this.gameWidth + 25) {
//           const newStart = this.getNewStart(this.gameWidth, this.gameHeight);
//           Matter.Body.setPosition(ball, newStart.position);
//           this.games[gameId].velocity = newStart.velocity;
//         }
//         Matter.Body.setVelocity(ball, this.games[gameId].velocity);
//         player1.emit('updateOpponentPaddle', JSON.stringify({ x: paddle2.position.x, y: paddle2.position.y }));
//         player2.emit('updateOpponentPaddle', JSON.stringify({ x: paddle1.position.x, y: paddle1.position.y }));
//         player1.emit('updateBallState', JSON.stringify({
//           x: ball.position.x,
//           y: ball.position.y,
//         }));
//         player2.emit('updateBallState', JSON.stringify({
//           x: ball.position.x,
//           y: ball.position.y,
//         }));
//       });

//     };
//   }
// }

// class GameInstance {
//   engine: Matter.Engine;
//   world: Matter.World;
//   runner: Matter.Runner;
//   delta: number;

//   constructor() {
//     this.engine = Matter.Engine.create();
//     this.world = this.engine.world;
//     this.delta = 1000 / 60; // 60 FPS
//     this.engine.world.gravity.y = 0;
//   }
// }
