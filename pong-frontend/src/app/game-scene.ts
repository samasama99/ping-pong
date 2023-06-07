
// export class GameScene extends Phaser.Scene {
//   private paddle1!: Phaser.GameObjects.Graphics;
//   private paddle2!: Phaser.GameObjects.Graphics;
//   private ball!: Phaser.GameObjects.Graphics;
//   private cursors!: any;
//   private paddleSpeed: number = 600;

//   constructor() {
//     super({ key: 'game' });
//   }

//   init_paddle(pos: { x: number, y: number }) {
//     let paddle = this.add.graphics();
//     paddle.fillStyle(0xD3D3D3);
//     paddle.fillRect(-15, -75, 30, 150);
//     paddle.x = pos.x;
//     paddle.y = pos.y;
//     return paddle;
//   }

//   init_ball(pos: { x: number, y: number }): Phaser.GameObjects.Graphics {
//     let ball = this.add.graphics();
//     ball.fillStyle(0xD3D3D3);
//     ball.fillRect(-15, -15, 30, 30);
//     ball.x = pos.x;
//     ball.y = pos.y;
//     return ball;
//   }

//   preload() {
//     console.log('preload method');
//   }

//   create() {
//     // Set up game objects and initial state here
//     console.log('create method');
//     const gameHeight = this.sys.canvas.height; // Get the height of the game
//     const gameWidth = this.sys.canvas.width; // Get the height of the game
//     this.paddle1 = this.init_paddle({ x: 60, y: gameHeight / 2 });
//     this.paddle2 = this.init_paddle({ x: gameWidth - 90, y: gameHeight / 2 });
//     this.ball = this.init_ball({ x: gameWidth / 2, y: gameHeight / 2 });
//     this.paddle1.setCollideWorldBounds(true);
//     this.paddle1.setImmovable(true);

//     this.paddle2.setCollideWorldBounds(true);
//     this.paddle2.setImmovable(true);

//     this.ball.setCollideWorldBounds(true);
//     this.ball.setBounce(1);
//     this.cursors = this.input?.keyboard?.createCursorKeys();
//     // this.input?.keyboard?.on('keydown', (event: KeyboardEvent) => {
//     //   if (event.code === 'ArrowUp') {
//     //     this.paddle1.y -= 50; // Adjust the desired movement value as needed
//     //   } else if (event.code === 'ArrowDown') {
//     //     this.paddle1.y += 50; // Adjust the desired movement value as needed
//     //   }
//     // });
//   }

//   override update(_: number, delta: number) {
//     // Update game state in the game loop here
//     // if (this.cursors.up.isDown) {
//     //   this.paddle1.y -= this.paddleSpeed * (delta / 1000);
//     // } else if (this.cursors.down.isDown) {
//     //   this.paddle1.y += this.paddleSpeed * (delta / 1000);
//     // }
//     if (this.cursors.up.isDown) {
//       this.paddle1.setVelocityY(-this.paddleSpeed);
//     } else if (this.cursors.down.isDown) {
//       this.paddle1.setVelocityY(this.paddleSpeed);
//     } else {
//       this.paddle1.setVelocityY(0);
//     }
//   }
// }

// import Phaser from 'phaser';
// import { Physics } from 'phaser';
// import 'phaser3-nineslice';

// export class GameScene extends Phaser.Scene {

//   private paddle1!: Phaser.Physics.Arcade.Image;
//   private paddle2!: Phaser.Physics.Arcade.Image;
//   private ball!: Phaser.Physics.Arcade.Image;
//   private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
//   private paddleSpeed: number = 600; // Adjust the paddle speed as needed

//   constructor() {
//     super({ key: 'game' });
//   }

//   preload() {
//     console.log('preload method');
//     this.load.image('paddle', '../assets/paddle.png')
//     this.load.image('ball', '../assets/ball.png')
//   }

//   create() {
//     console.log('create method');
//     const gameHeight = this.sys.canvas.height; // Get the height of the game
//     const gameWidth = this.sys.canvas.width; // Get the width of the game

//     this.paddle1 = this.physics.add.image(60, gameHeight / 2, 'paddle');
//     this.paddle2 = this.physics.add.image(gameWidth - 90, gameHeight / 2, 'paddle');
//     this.ball = this.physics.add.image(gameWidth / 2, gameHeight / 2, 'ball');
//     console.log(this.paddle1, this.paddle2, this.ball)
//     this.physics.world.enable([this.paddle1, this.paddle2, this.ball]);

//     this.paddle1.setCollideWorldBounds(true);
//     // this.paddle1.setImmovable(true);

//     this.paddle2.setCollideWorldBounds(true);
//     // this.paddle2.setImmovable(true);

//     this.ball.setCollideWorldBounds(true);
//     // this.ball.setBounce(1);
//     // this.ball.setBounceX(1);
//     // this.ball.setBounceY(10);

//     // Set up keyboard input
//     this.cursors = this.input?.keyboard?.createCursorKeys()!;
//     this.physics.add.collider(this.ball, this.paddle1, this.handleBallPaddleCollision, undefined, this);
//     this.physics.add.collider(this.ball, this.paddle2, this.handleBallPaddleCollision, undefined, this);
//   }

//   // private handleBallPaddleCollision(ball: Phaser.Physics.Arcade.Image, paddle: Phaser.Physics.Arcade.Image) {
//   //   // Reverse the horizontal velocity of the ball to simulate bounce
//   //   ball.setVelocityX(-(ball.body?.velocity.x ?? 0));
//   // }
//   //
//   private handleBallPaddleCollision(ball: Physics.Arcade.Image, paddle: Physics.Arcade.Image) {
//     // Reverse the horizontal velocity of the ball to simulate bounce
//     ball.setVelocityX(-(ball.body?.velocity.x ?? 0));
//   }

//   override update(time: number, delta: number) {
//     // Update game state in the game loop here
//     console.log('update method');

//     this.ball.setVelocity(-500, 0);
//     // Handle paddle movement
//     if (this.cursors.up.isDown) {
//       this.paddle1.setVelocityY(-this.paddleSpeed);
//     } else if (this.cursors.down.isDown) {
//       this.paddle1.setVelocityY(this.paddleSpeed);
//     } else {
//       this.paddle1.setVelocityY(0);
//     }
//   }
// }


import Phaser from 'phaser';
import { Physics } from 'phaser';
import 'phaser3-nineslice';

export class GameScene extends Phaser.Scene {

  private wallUp!: Phaser.Physics.Arcade.Image;
  private wallDown!: Phaser.Physics.Arcade.Image;
  // private wallRight!: Phaser.Physics.Arcade.Image;
  // private wallLeft!: Phaser.Physics.Arcade.Image;
  private paddle1!: Phaser.Physics.Arcade.Image;
  private paddle2!: Phaser.Physics.Arcade.Image;
  private ball!: Phaser.Physics.Arcade.Image;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private paddleSpeed: number = 750; // Adjust the paddle speed as needed
  private player1Score = 0;
  private player2Score = 0;
  private scoreText1!: Phaser.GameObjects.Text;
  private scoreText2!: Phaser.GameObjects.Text;
  private gameHeight = 0;
  private gameWidth = 0;

  constructor() {
    super({ key: 'game' });
  }

  preload() {
    // console.log('preload method');
    this.load.image('paddle', '../assets/paddle.png');
    this.load.image('ball', '../assets/ball.png');
    this.load.image('wall', '../assets/wall.png');
    // this.load.image('side_wall', '../assets/side_wall.png');
  }

  private getRandomNumber(min: number, max: number) {
    return Phaser.Math.Between(min, max)
  }

  // Usage example
  create() {
    // console.log('create method');
    this.gameHeight = this.sys.canvas.height; // Get the height of the game
    this.gameWidth = this.sys.canvas.width; // Get the width of the game

    this.paddle1 = this.physics.add.image(60, this.gameHeight / 2, 'paddle');
    this.paddle2 = this.physics.add.image(this.gameWidth - 90, this.gameHeight / 2, 'paddle');



    this.ball = this.physics.add.image(this.gameWidth / 2, this.gameHeight / 2, 'ball');
    this.wallUp = this.physics.add.image(650, 15, 'wall');
    this.wallDown = this.physics.add.image(650, this.gameHeight - 15, 'wall');
    this.physics.world.enable([this.paddle1, this.paddle2, this.ball, this.wallDown, this.wallUp]);

    this.paddle1.setCollideWorldBounds(true);
    this.paddle1.setImmovable(true);

    this.paddle2.setCollideWorldBounds(true);
    this.paddle2.setImmovable(true);

    this.wallDown.setCollideWorldBounds(true);
    this.wallDown.setImmovable(true);

    this.wallUp.setCollideWorldBounds(true);
    this.wallUp.setImmovable(true);

    this.ball.setBounce(1);

    this.cursors = this.input?.keyboard?.createCursorKeys()!;

    let randomVelocityX;
    let randomVelocityY;
    if (this.getRandomNumber(0, 1)) {
      randomVelocityX = this.getRandomNumber(500, 1000);
      randomVelocityY = this.getRandomNumber(500, 1000);
    } else {
      randomVelocityX = this.getRandomNumber(-500, -1000);
      randomVelocityY = this.getRandomNumber(-500, -1000);
    }
    this.ball.setVelocity(randomVelocityX, randomVelocityY);
    this.physics.add.collider(this.wallDown, this.paddle1, undefined, undefined, this);
    this.physics.add.collider(this.wallDown, this.paddle2, undefined, undefined, this);
    this.physics.add.collider(this.wallUp, this.paddle1, undefined, undefined, this);
    this.physics.add.collider(this.wallUp, this.paddle2, undefined, undefined, this);
    this.physics.add.collider(this.ball, this.paddle1, undefined, undefined, this);
    this.physics.add.collider(this.ball, this.paddle2, undefined, undefined, this);
    this.physics.add.collider(this.ball, this.wallUp, undefined, undefined, this);
    this.physics.add.collider(this.ball, this.wallDown, undefined, undefined, this);
    this.scoreText1 = this.add.text(16, 16, 'Player 1: 0', { fontSize: '32px', fill: '#fff' } as Phaser.Types.GameObjects.Text.TextStyle);
    this.scoreText2 = this.add.text(this.gameWidth - 16, 16, 'Player 2: 0', { fontSize: '32px', fill: '#fff' } as Phaser.Types.GameObjects.Text.TextStyle).setOrigin(1, 0);
  }

  // handleBallPaddleCollision(ball: Phaser.Physics.Arcade.Image, paddle: Phaser.Physics.Arcade.Image) {
  //   // console.log(paddle)
  //   // if (ball.body?.velocity.x && ball.body?.velocity.x <= 0.1) {
  //   //   console.log("fixed X");
  //   //   ball.setVelocity(this.getRandomNumber(500, 1000));
  //   // } else if (ball.body?.velocity.y && ball.body?.velocity.y <= 0.1) {
  //   //   console.log("fixed Y");
  //   //   ball.setVelocity(this.getRandomNumber(500, 1000));
  //   // }
  //   // if (paddle == this.wallLeft) {
  //   //   // const randomVelocityX = this.getRandomNumber(500, 1000);
  //   //   // const randomVelocityY = this.getRandomNumber(500, 1000);
  //   //   this.player2Score += 1;
  //   //   this.scoreText2.setText(`Player 1: ${this.player2Score}`);
  //   //   // this.ball.setVelocity(randomVelocityX, randomVelocityY);
  //   //   this.ball.setPosition(this.gameWidth / 2, this.gameHeight / 2);
  //   // }
  //   // else if (paddle == this.wallRight) {
  //   //   // const randomVelocityX = this.getRandomNumber(500, 1000);
  //   //   // const randomVelocityY = this.getRandomNumber(500, 1000);
  //   //   this.player1Score += 1;
  //   //   this.scoreText1.setText(`Player 1: ${this.player1Score}`);
  //   //   // this.ball.setVelocity(randomVelocityX, randomVelocityY);
  //   //   this.ball.setPosition(this.gameWidth / 2, this.gameHeight / 2);
  //   // }
  // }

  override update(time: number, delta: number) {
    // Update game state in the game loop here
    // console.log('update method');

    // Handle paddle movement
    if (this.ball.x < -150) {
      // console.log("yes");
      this.ball.setPosition(this.gameWidth / 2, this.getRandomNumber(50, this.gameHeight - 50));
      let randomVelocityX;
      let randomVelocityY;
      if (this.getRandomNumber(0, 1)) {
        randomVelocityX = this.getRandomNumber(500, 1000);
        randomVelocityY = this.getRandomNumber(500, 1000);
      } else {
        randomVelocityX = this.getRandomNumber(-500, -1000);
        randomVelocityY = this.getRandomNumber(-500, -1000);
      }
      this.player2Score += 1;
      this.scoreText2.setText(`Player 2: ${this.player2Score}`);
      this.ball.setVelocity(randomVelocityX, randomVelocityY);
    }
    if (this.ball.x > this.gameWidth + 150) {
      // console.log("yes");
      this.ball.setPosition(this.gameWidth / 2, this.getRandomNumber(50, this.gameHeight - 50));
      let randomVelocityX;
      let randomVelocityY;
      if (this.getRandomNumber(0, 1)) {
        randomVelocityX = this.getRandomNumber(500, 1000);
        randomVelocityY = this.getRandomNumber(500, 1000);
      } else {
        randomVelocityX = this.getRandomNumber(-500, -1000);
        randomVelocityY = this.getRandomNumber(-500, -1000);
      }
      this.player1Score += 1;
      this.scoreText1.setText(`Player 1: ${this.player1Score}`);
      this.ball.setVelocity(randomVelocityX, randomVelocityY);
    }
    if (this.cursors.up.isDown) {
      this.paddle1.setVelocityY(-this.paddleSpeed);
    } else if (this.cursors.down.isDown) {
      this.paddle1.setVelocityY(this.paddleSpeed);
    } else {
      this.paddle1.setVelocityY(0);
    }
  }
}
