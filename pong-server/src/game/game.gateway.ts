import { WebSocketGateway, SubscribeMessage } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import Matter from 'matter-js'


const GAMEWIDTH = 1232;
const GAMEHEIGHT = 685;
const BALLRADIUS = 18 / 2;
const PADDLEWIDTH = 12;
const PADDLEHEIGHT = 119;
const PADDLE1POSITION = { x: 27, y: GAMEHEIGHT / 2 };
const PADDLE2POSITION = { x: GAMEWIDTH - 27, y: GAMEHEIGHT / 2 };
const MAXANGLE = Math.PI / 4;

enum PlayerNumber { ONE, TWO };


@WebSocketGateway(3001, {
  cors: {
    origin: '*',
    credentials: true,
  }
}
)
export class GameGateway {
  private queue: Array<Socket> = [];
  private activeGameInstances: Map<number, GameInstance> = new Map();

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
    this.activeGameInstances.set(gameId, new GameInstance(gameId, player1, player2))
  }
}

class GameInstance {
  private engine: Matter.Engine;
  private world: Matter.World;
  private runner!: Matter.Runner;
  private paddle1: Matter.Body;
  private paddle2: Matter.Body;
  private ball: Matter.Body;
  private player1Ready: boolean = false;
  private player2Ready: boolean = false;
  private velocity: Matter.Vector;
  private score: { player1: number, player2: number } = { player1: 0, player2: 0 };
  private speed: number = 9.5;

  constructor(private gameId: number, private player1: Socket, private player2: Socket) {
    this.engine = Matter.Engine.create();
    this.world = this.engine.world;

    this.engine.gravity.x = 0;
    this.engine.gravity.y = 0;


    const newStart = this.getNewStart(GAMEWIDTH, GAMEHEIGHT);
    const ballPosition = newStart.position;
    this.velocity = newStart.velocity;

    this.ball = Matter.Bodies.circle(GAMEWIDTH / 2, GAMEHEIGHT / 2, BALLRADIUS);

    Matter.Body.setPosition(this.ball, ballPosition);
    Matter.Body.setVelocity(this.ball, this.velocity);

    this.paddle1 = Matter.Bodies.rectangle(PADDLE1POSITION.x, PADDLE1POSITION.y, PADDLEWIDTH, PADDLEHEIGHT, {
      isStatic: true
    });

    this.paddle2 = Matter.Bodies.rectangle(PADDLE2POSITION.x, PADDLE2POSITION.y, PADDLEWIDTH, PADDLEHEIGHT, {
      isStatic: true
    });

    Matter.World.add(this.world, [this.paddle1, this.paddle2, this.ball]);


    player1.on('sendMyPaddleState', (state) => {
      const position = JSON.parse(state);
      Matter.Body.setPosition(this.paddle1, position);
      player2.emit('updateOpponentPaddle', JSON.stringify({ x: this.paddle1.position.x, y: this.paddle1.position.y }));
    })

    player2.on('sendMyPaddleState', (state) => {
      const position = JSON.parse(state);
      Matter.Body.setPosition(this.paddle2, position);
      player1.emit('updateOpponentPaddle', JSON.stringify({ x: this.paddle2.position.x, y: this.paddle2.position.y }));
    })

    player1.on('disconnect', () => {
      player2.emit('changeState', JSON.stringify({ gameState: 'Finished' }))
      this.stopGame();
    });

    player2.on('disconnect', () => {
      player1.emit('changeState', JSON.stringify({ gameState: 'Finished' }))
      this.stopGame();
    });

    player1.emit('changeState', JSON.stringify({ gameState: 'Playing', playerNumber: "PlayerOne" }));
    player2.emit('changeState', JSON.stringify({ gameState: 'Playing', playerNumber: "PlayerTwo" }));


    player1.on('playerIsReady', () => {
      console.log('player1 is ready');
      this.player1Ready = true;

      if (this.player2Ready) {
        this.startGame();
      } else {
        player1.emit('waitingForOpponent');
      }
    });

    player2.on('playerIsReady', () => {
      console.log('player2 is ready');
      this.player2Ready = true;

      if (this.player1Ready) {
        this.startGame();
      } else {
        player2.emit('waitingForOpponent');
      }
    });

  }

  private setPlayerWon(player: PlayerNumber) {
    if (player == PlayerNumber.ONE) {
      this.player1.emit('changeState', JSON.stringify({ gameState: 'Finished' }));
      this.player2.emit('changeState', JSON.stringify({ gameState: 'Finished' }));
    } else {
      this.player1.emit('changeState', JSON.stringify({ gameState: 'Finished' }));
      this.player2.emit('changeState', JSON.stringify({ gameState: 'Finished' }));
    }
  }


  private updateScore() {
    this.player1.emit('UpdateScore', JSON.stringify(this.score))
    this.player2.emit('UpdateScore', JSON.stringify(this.score))
  }

  private stopGame() {
    Matter.World.clear(this.world, false);
    Matter.Engine.clear(this.engine);
    if (this.runner)
      Matter.Runner.stop(this.runner);
  }

  private resetBall() {
    console.log(this.ball.position);
    this.ball.isSleeping = true;
    setTimeout(() => this.ball.isSleeping = false, 150);
    const newStart = this.getNewStart(GAMEWIDTH, GAMEHEIGHT);
    Matter.Body.setPosition(this.ball, newStart.position);
    this.velocity = newStart.velocity;
  }

  private startGame() {
    console.log("Starting The Engine")
    this.runner = Matter.Runner.run(this.engine);
    console.log("paddle1", this.paddle1.position);
    console.log("paddle2", this.paddle2.position);
    console.log("ball", this.ball.position);

    Matter.Events.on(this.engine, 'afterUpdate', () => {
      if (this.ball.position.x < 0) {
        this.score.player2 += 1;
        this.updateScore();
        if (this.score.player2 == 7) {
          this.setPlayerWon(PlayerNumber.TWO);
          this.stopGame();
        } else {
          this.resetBall();
        }
      } else if (this.ball.position.x > GAMEWIDTH) {
        this.score.player1 += 1;
        this.updateScore();
        if (this.score.player1 == 7) {
          this.setPlayerWon(PlayerNumber.ONE);
          this.stopGame()
        } else {
          this.resetBall();
        }
      }

      if ((this.ball.velocity.y > 0 && this.ball.position.y + BALLRADIUS >= GAMEHEIGHT - 5)
        || (this.ball.velocity.y < 0 && this.ball.position.y - BALLRADIUS <= 5)) {
        this.velocity.y *= -1;
        Matter.Body.setVelocity(this.ball, this.velocity);
      }

      this.checkBallPaddleColision();

      this.sendBallPosition();

    });


    console.log("Starting Game :", this.gameId);
  }

  private sendBallPosition() {
    Matter.Body.setVelocity(this.ball, this.velocity);
    this.player1.emit('updateBallState', JSON.stringify({
      x: this.ball.position.x,
      y: this.ball.position.y,
    }));
    this.player2.emit('updateBallState', JSON.stringify({
      x: this.ball.position.x,
      y: this.ball.position.y,
    }));
  }

  private checkBallPaddleColision() {
    {
      const dx = this.ball.position.x - this.paddle1.position.x;
      const dy = this.ball.position.y - this.paddle1.position.y;

      if (Math.abs(dx) <= (this.ball.circleRadius + PADDLEWIDTH / 2) && Math.abs(dy) <= (BALLRADIUS + PADDLEHEIGHT / 2)) {
        const angle = Math.atan2(dy, dx);

        const limitedAngle = Math.max(-MAXANGLE, Math.min(angle, MAXANGLE));

        this.velocity.x = Math.cos(limitedAngle) * this.speed;
        this.velocity.y = Math.sin(limitedAngle) * this.speed;
        Matter.Body.setVelocity(this.ball, this.velocity);
      }
    }
    {
      const dx = this.ball.position.x - this.paddle2.position.x;
      const dy = this.ball.position.y - this.paddle2.position.y;

      if (Math.abs(dx) <= (BALLRADIUS + PADDLEWIDTH / 2) && Math.abs(dy) <= (BALLRADIUS + PADDLEHEIGHT / 2)) {
        const angle = Math.atan2(dy, dx);

        const limitedAngle = Math.max(-MAXANGLE, Math.min(angle, MAXANGLE));

        this.velocity.x = -Math.cos(limitedAngle) * this.speed;
        this.velocity.y = Math.sin(limitedAngle) * this.speed;
        Matter.Body.setVelocity(this.ball, this.velocity);
      }

    }
  }

  private getNewStart(gameWidth, gameHeight) {
    const angle = Matter.Common.random(-75, -25) + Matter.Common.random(0, 1) * 100; // Random angle between -75 and -25, or between 25 and 75 degrees

    const angleRad = this.degreesToRadians(angle);

    const directionX = Math.cos(angleRad);
    const directionY = Math.sin(angleRad);

    const velocity = {
      x: directionX * this.speed,
      y: directionY * this.speed,
    };

    const position = {
      x: gameWidth / 2,
      y: this.getRandomNumberRange(0, gameHeight),
    };

    this.speed += 0.5;
    return { position, velocity };
  }

  private degreesToRadians(degrees: number) {
    return (degrees * Math.PI) / 180;
  }

  private getRandomNumberRange(min: number, max: number) {
    return Matter.Common.random(min, max);
  }
}
