import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
  private paddle1!: Phaser.GameObjects.Graphics;
  private paddle2!: Phaser.GameObjects.Graphics;
  private ball!: Phaser.GameObjects.Graphics;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super({ key: 'game' });
  }

  init_paddle(pos: { x: number, y: number }) {
    let paddle = this.add.graphics();
    paddle.fillStyle(0xff0000);
    paddle.fillRect(-15, -75, 30, 150);
    paddle.x = pos.x;
    paddle.y = pos.y;
    return paddle;
  }

  init_ball(pos: { x: number, y: number }): Phaser.GameObjects.Graphics {
    let ball = this.add.graphics();
    ball.fillStyle(0xff0000);
    ball.fillRect(-15, -15, 30, 30);
    ball.x = pos.x;
    ball.y = pos.y;
    return ball;
  }

  preload() {
    console.log('preload method');
  }

  create() {
    // Set up game objects and initial state here
    console.log('create method');
    const gameHeight = this.sys.canvas.height; // Get the height of the game
    const gameWidth = this.sys.canvas.width; // Get the height of the game
    this.paddle1 = this.init_paddle({ x: 60, y: gameHeight / 2 });
    this.paddle2 = this.init_paddle({ x: gameWidth - 90, y: gameHeight / 2 });
    this.ball = this.init_ball({ x: gameWidth / 2, y: gameHeight / 2 });
    // const cursors = this.input?.keyboard?.createCursorKeys();

    // console.log(cursors);
    // cursors?.up.on('down', () => {
    //   this.paddle1.y -= 10; // Adjust the desired movement value as needed
    // });

    // cursors?.down.on('down', () => {
    //   this.paddle1.y += 10; // Adjust the desired movement value as needed
    // });

    this.input?.keyboard?.on('keydown', (event: KeyboardEvent) => {
      if (event.code === 'ArrowUp') {
        this.paddle1.y -= 10; // Adjust the desired movement value as needed
      } else if (event.code === 'ArrowDown') {
        this.paddle1.y += 10; // Adjust the desired movement value as needed
      }
    });
  }

  override update() {
    // Update game state in the game loop here
    console.log('update method');
    // this.paddle.y += 1;
  }
}
