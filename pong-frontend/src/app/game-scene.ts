import Phaser from 'phaser';
import 'phaser3-nineslice';
import { Store } from '@ngrx/store';
import { CreateGame, IncrementPlayer1Score, IncrementPlayer2Score, MovePlayer1, MovePlayer2, MoveBall, UpdatePlayer1, UpdatePlayer2 } from './game-state/game.actions'
import { GameState } from './game-state/game.state';

import { Game } from "phaser";
import { getGameState, selectBall, selectPlayer1Score, selectPlayer1Velocity, selectPlayer2Score, selectPlayer2Velocity } from './game-state/game.selectors';


export class GameScene extends Phaser.Scene {

  private wallUp!: Phaser.Physics.Arcade.Image;
  private wallDown!: Phaser.Physics.Arcade.Image;
  private paddle1!: Phaser.Physics.Arcade.Image;
  private paddle2!: Phaser.Physics.Arcade.Image;
  private ball!: Phaser.Physics.Arcade.Image;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private paddleSpeed: number = 950; // Adjust the paddle speed as needed
  private player1Score = 0;
  private player2Score = 0;
  private scoreText1!: Phaser.GameObjects.Text;
  private scoreText2!: Phaser.GameObjects.Text;
  private winTextPlayer1!: Phaser.GameObjects.Text;
  private winTextPlayer2!: Phaser.GameObjects.Text;
  private gameHeight = 0;
  private gameWidth = 0;
  private respawnDelayTimer: Phaser.Time.TimerEvent | undefined;
  private store: Store<GameState>;
  readonly inital_ball_speed = 650;

  constructor(store: Store<GameState>) {
    super({ key: 'game' });
    this.store = store;
  }

  init() {
    console.log("init")
    this.store.dispatch(CreateGame());
  }

  preload() {
    this.load.image('paddle', '../assets/paddle.png');
    this.load.image('ball', '../assets/ball.png');
    this.load.image('wall', '../assets/wall.png');
  }

  private getRandomNumber(min: number, max: number) {
    return Phaser.Math.Between(min, max)
  }

  setupGameObject() {
    this.paddle1 = this.physics.add.image(60, this.gameHeight / 2, 'paddle');
    this.paddle2 = this.physics.add.image(this.gameWidth - 90, this.gameHeight / 2, 'paddle');

    this.ball = this.physics.add.image(this.gameWidth / 2, this.gameHeight / 2, 'ball');

    this.wallUp = this.physics.add.image(650, 15, 'wall');
    this.wallDown = this.physics.add.image(650, this.gameHeight - 15, 'wall');
  }

  setupGamePhysics() {
    this.physics.world.enable([this.paddle1, this.paddle2, this.ball, this.wallDown, this.wallUp]);

    this.paddle1.setCollideWorldBounds(true);
    this.paddle1.setImmovable(true);

    this.paddle2.setCollideWorldBounds(true);
    this.paddle2.setImmovable(true);

    this.wallDown.setCollideWorldBounds(true);
    this.wallDown.setImmovable(true);

    this.wallUp.setCollideWorldBounds(true);
    this.wallUp.setImmovable(true);

    this.physics.add.collider(this.ball, [this.paddle1, this.paddle2], this.handleBallPaddleCollision as any, undefined, this);
    this.physics.add.collider(this.ball, [this.wallUp, this.wallDown], this.handleBallWallCollision as any, undefined, this);

    this.ball.setBounce(1);
    this.ball.setPushable(false);
  }

  resetBall() {
    console.log("resetBall")
    if (this.ball.body) {
      const sign = Phaser.Math.RND.between(0, 1) ? -1 : 1;
      const angle = Phaser.Math.RND.between(sign * 55, sign * 25);

      const angleRad = Phaser.Math.DegToRad(angle);

      const directionX = Math.cos(angleRad);
      const directionY = Math.sin(angleRad);

      const length = Math.sqrt(directionX ** 2 + directionY ** 2);
      const normalizedDirectionX = directionX / length;
      const normalizedDirectionY = directionY / length;

      const velocityX = normalizedDirectionX * this.inital_ball_speed;
      const velocityY = normalizedDirectionY * this.inital_ball_speed;

      const ball_x = this.gameWidth / 2;
      const ball_y = this.getRandomNumber(100, this.gameHeight - 100);

      this.ball.setVelocity(velocityX, velocityY);
      this.ball.setPosition(ball_x, ball_y);

      if (this.ball.body) {
        this.store.dispatch(MoveBall({
          new_pos: { x: this.ball.x, y: this.ball.y },
          new_velocity: { x: this.ball.body.velocity.x, y: this.ball.body.velocity.y },
          new_speed: this.ball.body.velocity.length()
        }))
      }
    }
  }

  initText() {
    this.winTextPlayer1 = this.add.text(400, 150, '', { fontSize: '128px', fill: '#fff' } as Phaser.Types.GameObjects.Text.TextStyle);
    this.winTextPlayer2 = this.add.text(900, 150, '', { fontSize: '128px', fill: '#fff' } as Phaser.Types.GameObjects.Text.TextStyle);
    this.scoreText1 = this.add.text(475, 50, '0', { fontSize: '128px', fill: '#fff' } as Phaser.Types.GameObjects.Text.TextStyle);
    this.scoreText2 = this.add.text(this.gameWidth - 475, 50, '0', { fontSize: '128px', fill: '#fff' } as Phaser.Types.GameObjects.Text.TextStyle).setOrigin(1, 0);
  }

  create() {
    this.gameHeight = this.sys.canvas.height;
    this.gameWidth = this.sys.canvas.width;
    this.cursors = this.input?.keyboard?.createCursorKeys()!;
    this.setupGameObject();
    this.setupGamePhysics();
    this.initText();

    this.store.select(getGameState).subscribe(state => {
      console.log("select state", state);
      this.game_state = state;
    })

    this.physics.pause();

  }

  // degrees_to_radians(degrees: number) {
  //   var pi = Math.PI;
  //   return degrees * (pi / 180);
  // }

  // handleBallPaddleCollision(ball: Phaser.Physics.Arcade.Image, paddle: Phaser.Physics.Arcade.Image) {
  //   if (this.ball.body) {
  //     if (this.current_ball_speed < 1500) {
  //       this.current_ball_speed = Math.sqrt(this.ball.body.velocity.x ** 2 + this.ball.body.velocity.y ** 2);
  //       this.ball.setVelocity(this.ball.body.velocity.x * 1.02, this.ball.body.velocity.y * 1.02);
  //     }
  //     this.store.dispatch(UpdateBall({
  //       new_pos: { x: this.ball.x, y: this.ball.y },
  //       new_velocity: { x: this.ball.body.velocity.x, y: this.ball.body.velocity.y },
  //       new_speed: this.current_ball_speed
  //     }))
  //   }
  // }

  handleBallPaddleCollision() {
    // if (this.ball.body && this.game_state == 'player1') {
    //   const ballBounds = this.ball.getBounds();
    //   const paddle1Bounds = this.paddle1.getBounds();
    //   const paddle2Bounds = this.paddle2.getBounds();
    //   const ballRight = ballBounds.right;
    //   const ballLeft = ballBounds.left;
    //   const paddle1Right = paddle1Bounds.right;
    //   const paddle1Left = paddle1Bounds.left;
    //   const paddle2Right = paddle2Bounds.right;
    //   const paddle2Left = paddle2Bounds.left;

    //   if ((ballLeft >= paddle1Right && ballRight >= paddle1Left) || (ballRight <= paddle2Left && ballLeft <= paddle2Right)) {
    //     // Increase the ball speed
    //     this.ball.body.velocity.x *= 1.02;
    //     this.ball.body.velocity.y *= 1.02;
    //     // if (this.game_state == 'player1') {
    //     //   this.store.dispatch(MoveBall({
    //     //     new_pos: { x: this.ball.x, y: this.ball.y },
    //     //     new_velocity: { x: this.ball.body.velocity.x, y: this.ball.body.velocity.y },
    //     //     new_speed: this.ball.body.velocity.length()
    //     //   }));
    //     // }
    //   }
    // }
  }

  handleBallWallCollision(ball: Phaser.Physics.Arcade.Image, paddle: Phaser.Physics.Arcade.Image) {
    // if (this.ball.body && this.game_state == 'player1') {
    //   this.store.dispatch(UpdateBall({
    //     new_pos: { x: this.ball.x, y: this.ball.y },
    //     new_velocity: { x: this.ball.body.velocity.x, y: this.ball.body.velocity.y },
    //     new_speed: this.ball.body.velocity.length()
    //   }))
    // }

  }


  movePaddleToPosition(targetX: number, targetY: number, speed: number) {
    const distanceX = Math.abs(targetX - this.paddle2.x);
    const distanceY = Math.abs(targetY - this.paddle2.y);
    const duration = Math.max(distanceX, distanceY) / speed * 1000; // Convert speed to duration in milliseconds

    this.tweens.add({
      targets: this.paddle2,
      x: targetX,
      y: targetY,
      duration: duration,
      ease: 'Linear',
      onUpdate: () => {
        // Update the physics body position while tweening
        if (this.paddle2.body) {
          this.paddle2.body.x = this.paddle2.x;
          this.paddle2.body.y = this.paddle2.y;
        }
      }
    });
  }


  private game_state = 'pending';
  private start = true;
  override update() {

    if (this.player1Score === 100) {
      this.scene.pause();
      this.winTextPlayer1.setText(`WIN`);
      console.log("Game paused!");
      return;
    }
    else if (this.player2Score === 100) {
      this.scene.pause();
      this.winTextPlayer2.setText(`WIN`);
      console.log("Game paused!");
      return;
    }

    if (this.game_state == 'pending') {
      this.physics.pause();
      return;
    }
    else if (this.game_state == 'in queue') {
      // this.resetBall()
    }
    else if (this.game_state == 'player1') {
      if (this.start) {
        console.log("start")
        this.resetBall()
        // if (this.ball.body?.velocity) {
        //   this.store.dispatch(MoveBall({
        //     new_pos: { x: this.ball.x, y: this.ball.y },
        //     new_velocity: { x: this.ball.body.velocity.x, y: this.ball.body.velocity.y },
        //     new_speed: this.ball.body.velocity.length()
        //   }))
        // }
        this.store.select(selectPlayer2Velocity).subscribe(velocity => {
          console.log("select player2 moved", velocity);
          this.paddle2.setVelocityY(velocity);
          // this.store.dispatch(UpdatePlayer2({ new_velocityY: velocity.velocity }));
        })
        this.start = false;
        this.physics.resume();
      }

      if (this.paddle1.body?.velocity) {
        if (this.cursors.up.isDown) {
          if (this.paddle1.body.velocity.y != -this.paddleSpeed) {
            this.paddle1.setVelocityY(-this.paddleSpeed);
            this.store.dispatch(MovePlayer1({ new_velocityY: this.paddle1.body.velocity.y }))
          }
        } else if (this.cursors.down.isDown) {
          if (this.paddle1.body.velocity.y != this.paddleSpeed) {
            this.paddle1.setVelocityY(this.paddleSpeed);
            this.store.dispatch(MovePlayer1({ new_velocityY: this.paddle1.body.velocity.y }))
          }
        } else if (this.paddle1.body?.velocity.y != 0) {
          this.paddle1.setVelocityY(0);
          this.store.dispatch(MovePlayer1({ new_velocityY: this.paddle1.body.velocity.y }))
        }
      }

      if (this.respawnDelayTimer && this.respawnDelayTimer.getProgress() === 1) {
        this.respawnDelayTimer = undefined;
      } else if (this.respawnDelayTimer) {
        return;
      }

      // if (this.ball.x < 0) {
      //   this.respawnDelayTimer = this.time.addEvent({
      //     delay: 150,
      //     callback: this.handleBallRespawn,
      //     callbackScope: this
      //   });
      // } else if (this.ball.x > this.gameWidth) {
      //   this.respawnDelayTimer = this.time.addEvent({
      //     delay: 150,
      //     callback: this.handleBallRespawn,
      //     callbackScope: this
      //   });
      // }


      if (this.ball.x < 0) {
        this.player2Score += 1;
        this.scoreText2.setText(`${this.player2Score}`);
        this.store.dispatch(IncrementPlayer2Score());
        if (this.game_state == 'player1')
          this.resetBall()
      } else if (this.ball.x > this.gameWidth) {
        this.player1Score += 1;
        this.scoreText1.setText(`${this.player1Score}`);
        this.store.dispatch(IncrementPlayer1Score());
        if (this.game_state == 'player1')
          this.resetBall()
      }


    } else if (this.game_state == 'player2') {

      // console.log("start 1 ************************");
      // console.log(this.ball.x);
      // console.log(this.ball.y);
      // console.log(this.ball.body?.velocity.x);
      // console.log(this.ball.body?.velocity.y);
      // console.log("************************ finish 1");
      if (this.start) {
        // this.ball.setBounce(0);
        this.store.select(selectBall).subscribe(state => {
          console.log("select ball position", state.position.x, state.position.y);
          console.log("select ball velocity", state.velocity.x, state.velocity.y);
          this.ball.setPosition(state.position.x, state.position.y);
          this.ball.setVelocity(state.velocity.x, state.velocity.y);
          // this.ball.setPosition(state.position);
          // this.ball.setVelocity(state.velocity);
          // console.log("ball 1", this.ball.x, this.ball.y)
          // console.log("ball 2", this.ball.body?.velocity.x, this.ball.body?.velocity.y)
        })
        this.store.select(selectPlayer1Velocity).subscribe((velocityY) => {
          console.log("select player1 moved", velocityY);
          this.paddle1.setVelocityY(velocityY);
          // if (velocity) {
          //   this.store.dispatch(UpdatePlayer1({ new_velocityY: velocity }));
          //   this.paddle1.setVelocityY(velocity.velocity);
          //   console.log("*", this.paddle1.x, this.paddle1.y);
          //   console.log("*", this.paddle1.body?.velocity);
          // }
        })

        this.store.select(selectPlayer1Score).subscribe((score) => {
          console.log(score);
          this.player1Score = score;
          this.scoreText1.setText(`${this.player1Score}`);
        })
        this.store.select(selectPlayer2Score).subscribe((score) => {
          console.log(score);
          this.player2Score = score;
          this.scoreText2.setText(`${this.player2Score}`);
        })

        this.start = false;
        this.physics.resume();
      }

      // console.log("start 2 ************************");
      // console.log(this.ball.x);
      // console.log(this.ball.y);
      // console.log(this.ball.body?.velocity.x);
      // console.log(this.ball.body?.velocity.y);
      // console.log("************************ finish 2");
      if (this.paddle2.body?.velocity) {
        if (this.cursors.up.isDown) {
          if (this.paddle2.body.velocity.y != -this.paddleSpeed) {
            this.paddle2.setVelocityY(-this.paddleSpeed);
            this.store.dispatch(MovePlayer2({ new_velocityY: this.paddle2.body.velocity.y }))
          }
        } else if (this.cursors.down.isDown) {
          if (this.paddle2.body.velocity.y != this.paddleSpeed) {
            this.paddle2.setVelocityY(this.paddleSpeed);
            this.store.dispatch(MovePlayer2({ new_velocityY: this.paddle2.body.velocity.y }))
          }
        } else if (this.paddle2.body?.velocity.y != 0) {
          this.paddle2.setVelocityY(0);
          this.store.dispatch(MovePlayer2({ new_velocityY: this.paddle2.body.velocity.y }))
        }
      }
    }



  }
  // private handleBallRespawn() {
  // }

}


 // { // PLAYER AI

    //   { // PLAYER AI
    //     const ballVelocityX = this.ball?.body?.velocity?.x ?? 0;

    //     if (ballVelocityX > 0) {
    //       const time = (this.paddle2.x - this.ball.x + -50) / ballVelocityX;
    //       const predictedY = this.ball.y + (this.ball.body?.velocity.y ?? 0) * time;

    //       if (!(predictedY < 60 || predictedY > this.gameHeight - 60)) {
    //         this.movePaddleToPosition(this.paddle2.x, predictedY, this.paddleSpeed);
    //       }
    //     } else {
    //       this.paddle2.setVelocityY(0);
    //     }
    //   }

    //   // if (this.paddle2.body?.velocity)
    //   //   this.store.dispatch(MovePlayer2({ new_velocityY: this.paddle2.body?.velocity.y }))

    //   // this.store.pipe(select(selectPlayer2Velocity)).subscribe((state: number) => {
    //   //   // console.log(state)
    //   // });
    //   // this.paddle2PosObservable.subscribe(({ x, y }) => {
    //   //   console.log("here")
    //   //   console.log(x, y)
    //   // });
    // }

