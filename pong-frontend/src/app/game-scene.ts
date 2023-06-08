import Phaser from 'phaser';
import 'phaser3-nineslice';
import { Store, select } from '@ngrx/store';
import { CreateGame, IncrementPlayerScore1, IncrementPlayerScore2, MovePlayer1, MovePlayer2, UpdateBall } from './game-state/game.actions'
import { Observable } from 'rxjs';
import { GameState } from './game-state/game.state';
import { inject } from '@angular/core';


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
    this.physics.add.collider(this.ball, [this.wallUp, this.wallDown], undefined, undefined, this);
    this.physics.add.collider(this.wallUp, [this.paddle1, this.paddle2], undefined, undefined, this);
    this.physics.add.collider(this.wallDown, [this.paddle1, this.paddle2], undefined, undefined, this);

    this.ball.setBounce(1);
  }

  resetBall() {
    const speed = 750;
    const angleRange1 = Phaser.Math.RND.between(-55, -25);
    const angleRange2 = Phaser.Math.RND.between(25, 55);

    const angle = (Phaser.Math.RND.between(0, 1) === 0) ? angleRange1 : angleRange2;
    const angleRad = Phaser.Math.DegToRad(angle);

    const directionX = Math.cos(angleRad);
    const directionY = Math.sin(angleRad);

    const length = Math.sqrt(directionX ** 2 + directionY ** 2);
    const normalizedDirectionX = directionX / length;
    const normalizedDirectionY = directionY / length;

    const velocityX = normalizedDirectionX * speed;
    const velocityY = normalizedDirectionY * speed;

    const ball_x = this.gameWidth / 2;
    const ball_y = this.getRandomNumber(100, this.gameHeight - 100);

    this.ball.setVelocity(velocityX, velocityY);
    this.ball.setPosition(this.gameWidth / 2, this.getRandomNumber(100, this.gameHeight - 100));
    this.store.dispatch(UpdateBall({
      new_pos: { x: ball_x, y: ball_y },
      new_velocity: { x: velocityX, y: velocityY },
      new_speed: speed
    }))
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
    this.resetBall();
    this.initText();
  }

  // degrees_to_radians(degrees: number) {
  //   var pi = Math.PI;
  //   return degrees * (pi / 180);
  // }

  handleBallPaddleCollision(ball: Phaser.Physics.Arcade.Image, paddle: Phaser.Physics.Arcade.Image) {
    if (this.ball.body) {
      // const impactAngle = Phaser.Math.Angle.Between(this.ball.x, this.ball.y, paddle.x, paddle.y);

      // // Calculate the new angle for the ball's direction

      // const newAngle = Math.PI - impactAngle;
      // console.log(impactAngle, newAngle)

      // Calculate the new velocity based on the angle
      const speed = Math.sqrt(this.ball.body.velocity.x ** 2 + this.ball.body.velocity.y ** 2);
      if (speed < 1500)
        this.ball.setVelocity(this.ball.body.velocity.x * 1.1, this.ball.body.velocity.y * 1.1);
      // if (impactAngle < this.degrees_to_radians(15)) {
      //   console.log("new angle apply")
      //   const newVelocityX = Math.cos(newAngle) * speed;
      //   const newVelocityY = Math.sin(newAngle) * speed;

      //   // Set the new velocity for the ball
      //   this.ball.setVelocity(newVelocityX, newVelocityY);
      // }
      this.store.dispatch(UpdateBall({
        new_pos: { x: this.ball.x, y: this.ball.y },
        new_velocity: { x: this.ball.body.velocity.x, y: this.ball.body.velocity.y },
        new_speed: speed
      }))
    }

    // if (this.ball.body) {
    //   const speed = Math.sqrt(this.ball.body?.velocity.x ** 2 + this.ball.body?.velocity.y ** 2);
    //   if (speed < 1500)
    //     this.ball.setVelocity(this.ball.body?.velocity.x * 1.1, this.ball.body?.velocity.y * 1.1);
    // }
  }

  override update() {
    // console.log("update", this.ball.x, this.ball.y)
    if (this.cursors.up.isDown) {
      this.paddle1.setVelocityY(-this.paddleSpeed);
    } else if (this.cursors.down.isDown) {
      this.paddle1.setVelocityY(this.paddleSpeed);
    } else {
      this.paddle1.setVelocityY(0);
    }

    { // PLAYER AI
      const ballVelocityX = this.ball?.body?.velocity?.x ?? 0;

      if ((ballVelocityX > 0)) {
        const time = (this.paddle2.x - this.ball.x + -50) / ballVelocityX;
        const predictedY = this.ball.y + (this.ball.body?.velocity.y ?? 0) * time

        if (!(predictedY < 60 || predictedY > this.gameHeight - 60)) {

          if (this.paddle2.y - predictedY < 15 && this.paddle2.y - predictedY > -15) {
            this.paddle2.setVelocityY(0);
          } else if (this.paddle2.y < predictedY) {
            this.paddle2.setVelocityY(this.paddleSpeed);
          } else if (this.paddle2.y > predictedY) {
            this.paddle2.setVelocityY(-this.paddleSpeed);
          } else {
            this.paddle2.setVelocityY(0);
          }
        }

      } else {
        this.paddle2.setVelocityY(0);
      }
    }

    if (this.player1Score === 3) {
      this.scene.pause();
      this.winTextPlayer1.setText(`WIN`);
      console.log("Game paused!");
      return;
    }
    if (this.player2Score === 3) {
      this.scene.pause();
      this.winTextPlayer2.setText(`WIN`);
      console.log("Game paused!");
      return;
    }

    // console.log({ respawnDelayTimer: this.respawnDelayTimer?.getProgress() })
    if (this.respawnDelayTimer && this.respawnDelayTimer.getProgress() === 1) {
      this.respawnDelayTimer = undefined;
    } else if (this.respawnDelayTimer) {
      // console.log("skip")
      return;
    }
    if (this.ball.x < 0) {
      this.respawnDelayTimer = this.time.addEvent({
        delay: 150, // Adjust the delay time (in milliseconds) as needed
        callback: this.handleBallRespawn,
        callbackScope: this
      });
    } else if (this.ball.x > this.gameWidth) {
      this.respawnDelayTimer = this.time.addEvent({
        delay: 150, // Adjust the delay time (in milliseconds) as needed
        callback: this.handleBallRespawn,
        callbackScope: this
      });
    }

  }
  private handleBallRespawn() {
    // console.log(this.ball.x)
    if (this.ball.x < 0) {
      this.store.dispatch(IncrementPlayerScore2());
      this.player2Score += 1;
      this.scoreText2.setText(`${this.player2Score}`);
    } else if (this.ball.x > this.gameWidth) {
      this.store.dispatch(IncrementPlayerScore1());
      this.player1Score += 1;
      this.scoreText1.setText(`${this.player1Score}`);
    }

    // this.physics.resume();
    this.resetBall()
  }

}
