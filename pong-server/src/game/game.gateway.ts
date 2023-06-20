import { WebSocketGateway, SubscribeMessage, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Bodies, Body, Common, Engine, Events, Runner, World, } from 'matter-js';
import { Socket } from 'socket.io';
import { sampleSize } from 'lodash';

import * as flatbuffers from 'flatbuffers';
import { PositionState } from 'src/position-state';
import { UserService } from 'src/user/user.service';
import { Inject } from '@nestjs/common';
export enum Color { White = 'White', Blue = 'Blue', Green = 'Green' };


const GAMEWIDTH = 1232;
const GAMEHEIGHT = 685;
const BALLRADIUS = 20 / 2;
const PADDLEWIDTH = 12;
const PADDLEHEIGHT = 119;
const PADDLE1POSITION = { x: 27, y: GAMEHEIGHT / 2 };
const PADDLE2POSITION = { x: GAMEWIDTH - 27, y: GAMEHEIGHT / 2 };
const MAXANGLE = Math.PI / 4;
const INITALBALLSPEED = 10;
const DAMPINGFACTOR = 0.99;

enum PlayerNumber { One, Two };


@WebSocketGateway(3001, {
  cors: {
    origin: '*',
    credentials: true,
  }
})
export class GameGateway
  implements OnGatewayDisconnect {
  private queue: Array<{ id: number, socket: Socket }> = [];
  private currentPlayers = new Array<{ id: number, socket: Socket }>();
  private activeGameInstances: { [key: string]: GameInstance } = {};

  constructor(private userService: UserService) {
    setInterval(() => {
      console.log("queue :", this.queue.map(_ => _.id));
      console.log("active game instances :", Object.keys(this.activeGameInstances));
      console.log("current players :", this.currentPlayers.map(_ => _.id));
      // console.log("before", process.memoryUsage())
      this.activeGameInstances = Object.entries(this.activeGameInstances)
        .filter(([_, gameInstance]) => !gameInstance.inactive)
        .reduce((result, [key, value]) => {
          result[key] = value;
          return result;
        }, {});

      if (this.queue.length >= 2) {
        let [player1, player2]: { id: number, socket: Socket }[] = sampleSize(this.queue, 2);
        player1.socket.emit('acceptedInvite')
        player2.socket.emit('acceptedInvite')
        this.queue = this.queue.filter(player => player.id !== player1.id && player.id !== player2.id);
        this.activeGameInstances[`${player1.id},${player2.id}`] = new GameInstance(player1.socket, player2.socket);
        this.currentPlayers.push(player1);
        this.currentPlayers.push(player2);
      }
      // console.log("after", process.memoryUsage())
    }, 1000);
  }

  handleDisconnect(socket: any) {
    this.userService.handleDisconnect(socket);
  }

  @SubscribeMessage('logIn')
  logIn(socket: Socket, payload: string) {
    this.userService.logIn(socket, payload);
  }


  @SubscribeMessage('createGame')
  create(socket: Socket, payload) {
    const { id1, id2 } = JSON.parse(payload);
    console.log({ id1, id2 });
    if (this.currentPlayers.find(player => player.id === id1))
      return;
    if (id2 && this.currentPlayers.find(player => player.id === id2))
      return;
    if (!id2) {
      this.queue.push({ id: id1, socket })
      socket.on('disconnect', () => {
        this.queue = this.queue.filter(player => player.socket !== socket);
        this.currentPlayers = this.currentPlayers.filter(player => player.socket !== socket);
        socket.removeAllListeners('disconnect');
      });
      socket.emit('changeState', JSON.stringify({ gameState: 'Queue' }));
    } else {
      // console.log("online list", this.userService.onlineUsers)
      const invitedUser = this.userService.onlineUsers.find(_ => _.id === id2);
      if (invitedUser) {
        invitedUser.socket.emit('invite', id1);
        invitedUser.socket.once('inviteResponse', (response) => {
          console.log("res", response);
          if (response === true) {
            const player1 = this.userService.onlineUsers.find(_ => _.id === id1);
            player1.socket.emit('acceptedInvite')
            const player2 = this.userService.onlineUsers.find(_ => _.id === id2);
            player2.socket.emit('acceptedInvite')
            this.activeGameInstances[`${player1.id},${player2.id}`] = new GameInstance(player1.socket, player2.socket);
            this.currentPlayers.push(player1);
            this.currentPlayers.push(player2);
          }
        })
        console.log('user is online', invitedUser.id);
      } else {
        console.log('user is offline', id2);
      }
    }
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
  private speed: number = INITALBALLSPEED;
  private checkBallPaddleColisionInterval: NodeJS.Timer;
  public inactive = false;



  constructor(private player1: Socket, private player2: Socket) {
    console.log("game is created (start)");
    this.engine = Engine.create();
    this.world = this.engine.world;

    this.engine.gravity.x = 0;
    this.engine.gravity.y = 0;


    this.velocity = this.getNewStart(GAMEWIDTH, GAMEHEIGHT).velocity;

    this.ball = Bodies.circle(GAMEWIDTH / 2, GAMEHEIGHT / 2, BALLRADIUS,
      {
        label: 'ball',
        restitution: 1.0, // Set the restitution to 1.0 for constant velocity
      }
    );

    Body.setVelocity(this.ball, this.velocity);

    this.paddle1 = Bodies.rectangle(PADDLE1POSITION.x, PADDLE1POSITION.y, PADDLEWIDTH, PADDLEHEIGHT, {
      isStatic: true
    });

    this.paddle2 = Bodies.rectangle(PADDLE2POSITION.x, PADDLE2POSITION.y, PADDLEWIDTH, PADDLEHEIGHT, {
      isStatic: true
    });

    World.add(this.world, [this.paddle1, this.paddle2, this.ball]);

    player1.on('ping', () => {
      player1.emit('pong');
    });
    player2.on('ping', () => {
      player2.emit('pong');
    });

    player1.on('sendMyPaddleState', (state) => {
      const buffer = new flatbuffers.ByteBuffer(new Uint8Array(state));
      const paddleState = PositionState.getRootAsPositionState(buffer);

      const x = paddleState.x();
      const y = paddleState.y();
      Body.setPosition(this.paddle1, { x, y });

      player2.emit('updateOpponentPaddle', state);
    });

    player2.on('sendMyPaddleState', (state) => {
      const buffer = new flatbuffers.ByteBuffer(new Uint8Array(state));
      const paddleState = PositionState.getRootAsPositionState(buffer);

      const x = paddleState.x();
      const y = paddleState.y();
      Body.setPosition(this.paddle2, { x, y });

      player1.emit('updateOpponentPaddle', state);
    });

    player1.on('disconnect', () => {
      player2.emit('changeState', JSON.stringify({ gameState: 'Finished', isWin: true }))
      this.stopGame();
    });

    player2.on('disconnect', () => {
      player1.emit('changeState', JSON.stringify({ gameState: 'Finished', isWin: true }))
      this.stopGame();
    });

    player1.emit('changeState', JSON.stringify({
      gameState: 'Playing', playerNumber: 1, color: Common.choose([Color.White, Color.Blue, Color.Green])
    }));
    player2.emit('changeState', JSON.stringify({
      gameState: 'Playing', playerNumber: 2, color: Common.choose([Color.White, Color.Blue, Color.Green])
    }));


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

    console.log("game is created (finish)");
  }

  private setPlayerWon(player: PlayerNumber) {
    if (player === PlayerNumber.One) {
      this.player1.emit('changeState', JSON.stringify({ gameState: 'Finished', isWin: true }));
      this.player2.emit('changeState', JSON.stringify({ gameState: 'Finished', isWin: false }));
    } else {
      this.player1.emit('changeState', JSON.stringify({ gameState: 'Finished', isWin: false }));
      this.player2.emit('changeState', JSON.stringify({ gameState: 'Finished', isWin: true }));
    }
  }


  private updateScore() {
    this.player1.emit('UpdateScore', JSON.stringify(this.score))
    this.player2.emit('UpdateScore', JSON.stringify(this.score))
  }

  private stopGame() {
    clearInterval(this.checkBallPaddleColisionInterval);
    World.remove(this.world, [this.paddle1, this.paddle2, this.ball]);
    World.clear(this.world, false);
    Engine.clear(this.engine);
    if (this.runner)
      Runner.stop(this.runner);

    this.player1.off('sendMyPaddleState', (state) => {
      const position = JSON.parse(state);
      Body.setPosition(this.paddle1, position);
      this.player2.emit('updateOpponentPaddle', JSON.stringify({ x: this.paddle1.position.x, y: this.paddle1.position.y }));
    })

    this.player2.off('sendMyPaddleState', (state) => {
      const position = JSON.parse(state);
      Body.setPosition(this.paddle2, position);
      this.player1.emit('updateOpponentPaddle', JSON.stringify({ x: this.paddle2.position.x, y: this.paddle2.position.y }));
    })

    this.player1.off('disconnect', () => {
      this.player2.emit('changeState', JSON.stringify({ gameState: 'Finished', isWin: true }))
      this.stopGame();
    });

    this.player2.off('disconnect', () => {
      this.player1.emit('changeState', JSON.stringify({ gameState: 'Finished', isWin: true }))
      this.stopGame();
    });

    this.player1.off('playerIsReady', () => {
      console.log('player1 is ready');
      this.player1Ready = true;

      if (this.player2Ready) {
        this.startGame();
      } else {
        this.player1.emit('waitingForOpponent');
      }
    });

    this.player2.off('playerIsReady', () => {
      console.log('player2 is ready');
      this.player2Ready = true;

      if (this.player1Ready) {
        this.startGame();
      } else {
        this.player2.emit('waitingForOpponent');
      }
    });

    this.inactive = true;

  }

  private resetBall() {
    // console.log(this.ball.position);
    this.ball.isSleeping = true;
    setTimeout(() => this.ball.isSleeping = false, 100);
    const newStart = this.getNewStart(GAMEWIDTH, GAMEHEIGHT);
    Body.setPosition(this.ball, newStart.position);
    this.velocity = newStart.velocity;
  }

  private startGame() {
    console.log("Starting The Engine")
    const runner = Runner.create({
      isFixed: true,
      delta: 1000 / 60 // Change the time step value here
    });
    this.engine.constraintIterations = 10;
    this.engine.velocityIterations = 10;
    this.engine.positionIterations = 10;

    this.runner = Runner.run(runner, this.engine);
    Events.on(this.engine, 'collisionStart', (event) => {
      const pairs = event.pairs;

      for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i];
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;

        if ((bodyA === this.ball && bodyB === this.paddle1) || (bodyB === this.ball && bodyA === this.paddle1)) {
          this.checkBallPaddle1Collision();
        } else if ((bodyA === this.ball && bodyB === this.paddle2) || (bodyB === this.ball && bodyA === this.paddle2)) {
          this.checkBallPaddle2Collision();
        }
      }
    });

    Events.on(this.engine, 'afterUpdate', () => {
      if (this.ball.position.x < -50) {
        this.score.player2 += 1;
        this.updateScore();
        if (this.score.player2 == 7) {
          this.setPlayerWon(PlayerNumber.Two);
          this.stopGame();
        } else {
          this.resetBall();
        }
      } else if (this.ball.position.x > GAMEWIDTH + 50) {
        this.score.player1 += 1;
        this.updateScore();
        if (this.score.player1 == 7) {
          this.setPlayerWon(PlayerNumber.One);
          this.stopGame()
        } else {
          this.resetBall();
        }
      }

      if ((this.ball.velocity.y > 0 && this.ball.position.y + BALLRADIUS >= GAMEHEIGHT - 5)
        || (this.ball.velocity.y < 0 && this.ball.position.y - BALLRADIUS <= 5)) {
        this.velocity.y *= -1;
        Body.setVelocity(this.ball, this.velocity);
      }

      // this.checkBallPaddleColision();

      this.sendBallPosition();

    });

    setInterval(() => {
      this.velocity.x *= DAMPINGFACTOR;
      this.velocity.y *= DAMPINGFACTOR;
    }, 100)

  }

  private sendBallPosition() {
    Body.setVelocity(this.ball, this.velocity);
    // console.log("velocity", ball.velocity)

    const builder = new flatbuffers.Builder();
    const ballStateOffset = PositionState.createPositionState(builder, this.ball.position.x, this.ball.position.y);
    builder.finish(ballStateOffset);
    const buffer = builder.asUint8Array();

    this.player1.emit('updateBallState', buffer);
    this.player2.emit('updateBallState', buffer);
  }

  private checkBallPaddle1Collision() {
    const dx = this.ball.position.x - this.paddle1.position.x;
    const dy = this.ball.position.y - this.paddle1.position.y;

    const angle = Math.atan2(dy, dx);

    const limitedAngle = Math.max(-MAXANGLE, Math.min(angle, MAXANGLE));

    this.velocity.x = Math.cos(limitedAngle) * this.speed;
    this.velocity.y = Math.sin(limitedAngle) * this.speed;
    Body.setVelocity(this.ball, this.velocity);
    this.speed += 1;
  }

  private checkBallPaddle2Collision() {
    const dx = this.ball.position.x - this.paddle2.position.x;
    const dy = this.ball.position.y - this.paddle2.position.y;

    const angle = Math.atan2(dy, dx);

    const limitedAngle = Math.max(-MAXANGLE, Math.min(angle, MAXANGLE));

    this.velocity.x = -Math.cos(limitedAngle) * this.speed;
    this.velocity.y = Math.sin(limitedAngle) * this.speed;
    Body.setVelocity(this.ball, this.velocity);
    this.speed += 1;
  }

  private getNewStart(gameWidth, gameHeight) {
    this.speed = INITALBALLSPEED;
    const angle = Common.random(Common.choose([-1, 1]) * 25, Common.choose([-1, 1]) * 55);
    const angleRad = this.degreesToRadians(Common.choose([-1, 1]) * angle);

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

    return { position, velocity };
  }

  private degreesToRadians(degrees: number) {
    return (degrees * Math.PI) / 180;
  }

  private getRandomNumberRange(min: number, max: number) {
    return Common.random(min, max);
  }
}
