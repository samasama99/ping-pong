import Phaser from 'phaser';
import 'phaser3-nineslice';
import { Store } from '@ngrx/store';
import { SendMyPaddlePosition, StartGame, UpdateOpponentPosition, } from './game-state/game.actions'
import { Color, GameState, Player } from './game-state/game.state';
import { selectBallState, selectOpponentPaddleState, selectPlayerScore } from './game-state/game.selectors';


export class GameScene extends Phaser.Scene {
  readonly paddleSpeed: number = 950; // Adjust the paddle speed as needed
  // readonly inital_ball_speed = 650;

  // private wallUp!: Phaser.Physics.Arcade.Image;
  // private wallDown!: Phaser.Physics.Arcade.Image;

  private myPaddle!: Phaser.Physics.Arcade.Image;
  private opponentPaddle!: Phaser.Physics.Arcade.Image;

  private ball!: Phaser.GameObjects.Image;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  private scoreText1!: Phaser.GameObjects.Text;
  private scoreText2!: Phaser.GameObjects.Text;
  private playerScore1!: number;
  private playerScore2!: number;
  // public star!: Phaser.GameObjects.Image;
  public win!: Phaser.GameObjects.Image;
  public background!: Phaser.GameObjects.Image;

  public winText!: Phaser.GameObjects.Text;
  private gameHeight = 0;
  private gameWidth = 0;
  private latestBallPosition: { x: number; y: number; } = { x: 0, y: 0 };
  private latestOpponentPosition: { x: number; y: number; } = { x: 0, y: 0 };


  constructor(private store: Store<GameState>, private playerNumber: Player, private color: Color) {
    super({ key: 'game' });
    console.log("constructor", playerNumber)
  }

  init() {
    console.log("init")
    this.store.dispatch(StartGame());
    console.log("Player Number", this.playerNumber);
  }

  preload() {
    if (this.color == Color.White) {
      this.load.image('background', 'assets/white/background.png');
      this.load.image('paddle', '../assets/white/paddle.png');
      this.load.image('ball', '../assets/white/ball.png');
      this.load.image('line', '../assets/white/line.png');
    } else {
      if (this.color == Color.Green) {
        this.load.image('background', 'assets/green/background.png');
      } else if (this.color == Color.Blue) {
        this.load.image('background', 'assets/blue/background.png');
      }
      this.load.image('paddle', '../assets/paddle.png');
      this.load.image('ball', '../assets/ball.png');
      this.load.image('line', '../assets/line.png');
    }
    this.load.image('win', '../assets/win.png');
  }

  // private getRandomNumber(min: number, max: number) {
  //   return Phaser.Math.Between(min, max)
  // }

  setupGameObject() {
    switch (this.playerNumber) {
      case Player.One:
        {
          console.log("init control PlayerOne")
          this.myPaddle = this.physics.add.image(27, this.gameHeight / 2, 'paddle');
          this.opponentPaddle = this.physics.add.image(this.gameWidth - 27, this.gameHeight / 2, 'paddle');
          break;
        }
      case Player.Two:
        {
          console.log("init control PlayerTwo")
          this.myPaddle = this.physics.add.image(this.gameWidth - 27, this.gameHeight / 2, 'paddle');
          this.opponentPaddle = this.physics.add.image(27, this.gameHeight / 2, 'paddle');
          break;
        }
      default:
        console.log("default")
    }

    if (this.myPaddle?.body && this.opponentPaddle?.body) {
      this.store.dispatch(SendMyPaddlePosition({ position: { x: this.myPaddle.x, y: this.myPaddle.y } }));
      this.store.dispatch(UpdateOpponentPosition({ position: { x: this.opponentPaddle.x, y: this.opponentPaddle.y } }))
    }

    this.ball = this.add.image(this.gameWidth / 2, this.gameHeight / 2, 'ball');
    this.win = this.add.image(this.gameWidth / 2, this.gameHeight / 2, 'win').setVisible(false);
    // this.star = this.add.image(this.gameWidth / 2, this.gameHeight / 2, 'star').setVisible(false);

    // this.star.displayWidth = 784.57; // Set the width to 100 pixels
    // this.star.displayHeight = 523.05; //

    // this.star.setDepth(1);
  }

  initText() {
    this.winText = this.add.text(this.gameWidth / 2 - 220, this.gameHeight / 2 - 100, '', { fontSize: '169px', fill: '#fff', fontFamily: 'Montserrat' } as Phaser.Types.GameObjects.Text.TextStyle);
    if (this.color == Color.White) {
      this.scoreText1 = this.add.text(555, 20, '0', { fontSize: '40px', fill: '#184E77', fontFamily: 'Montserrat' } as Phaser.Types.GameObjects.Text.TextStyle);
      this.scoreText2 = this.add.text(this.gameWidth - 555, 20, '0', { fontSize: '40px', fill: '#184E77', fontFamily: 'Montserrat' } as Phaser.Types.GameObjects.Text.TextStyle).setOrigin(1, 0);
    } else {
      this.scoreText1 = this.add.text(555, 20, '0', { fontSize: '40px', fill: '#fff', fontFamily: 'Montserrat' } as Phaser.Types.GameObjects.Text.TextStyle);
      this.scoreText2 = this.add.text(this.gameWidth - 555, 20, '0', { fontSize: '40px', fill: '#fff', fontFamily: 'Montserrat' } as Phaser.Types.GameObjects.Text.TextStyle).setOrigin(1, 0);
    }

  }

  public pingText!: Phaser.GameObjects.Text;
  create() {

    const textColor = this.color == Color.White ? "#184E77" : "#fff";

    const fpsText = this.add.text(30, 30, 'Fps: -', { fontSize: '16px', fill: textColor, fontFamily: 'Montserrat' } as Phaser.Types.GameObjects.Text.TextStyle);
    fpsText.setDepth(1);

    setInterval(() => {
      fpsText.setText(`Fps: ${Math.round(this.game.loop.actualFps)}`);
    }, 1000);

    this.pingText = this.add.text(90, 30, 'Ping: -', { fontSize: '16px', fill: textColor, fontFamily: 'Montserrat' } as Phaser.Types.GameObjects.Text.TextStyle);
    this.pingText.setDepth(1);

    this.gameHeight = this.sys.canvas.height;
    this.gameWidth = this.sys.canvas.width;
    this.cursors = this.input?.keyboard?.createCursorKeys()!;
    this.background = this.add.image(0, 0, 'background').setOrigin(0, 0);
    this.background.displayWidth = this.gameWidth; // Set the width to 100 pixels
    this.background.displayHeight = this.gameHeight; //
    this.add.image(this.gameWidth / 2, this.gameHeight / 2, 'line')
    this.cameras.main.setBackgroundColor('#103960');
    this.setupGameObject();
    this.initText();

    this.store.select(selectOpponentPaddleState)
      .subscribe((position) => {
        this.latestOpponentPosition = { x: position.x, y: position.y };
      });

    this.store.select(selectBallState)
      .subscribe(position => {
        this.latestBallPosition = { x: position.x, y: position.y };
      });

    this.store.select(selectPlayerScore)
      .subscribe(score => {
        this.playerScore1 = score.player1;
        this.playerScore2 = score.player2;
        this.scoreText1.setText(`${this.playerScore1}`)
        this.scoreText2.setText(`${this.playerScore2}`)
      });


    console.log("ball", this.ball.height, this.ball.width);
    console.log("ball", this.ball.getCenter());
    console.log("my paddle", this.myPaddle.height, this.myPaddle.width);
    console.log("my paddle", this.myPaddle.getCenter());
    console.log("opponent paddle", this.opponentPaddle.height, this.opponentPaddle.width);
    console.log("opponent paddle", this.opponentPaddle.getCenter());
  }

  override update() {
    this.opponentPaddle.setPosition(this.latestOpponentPosition.x, this.latestOpponentPosition.y);
    this.ball.setPosition(this.latestBallPosition.x, this.latestBallPosition.y);

    if (this.myPaddle.body?.velocity) {

      const newPaddleVelocity = new Phaser.Math.Vector2(0, 0);

      if (this.cursors.up.isDown) {
        newPaddleVelocity.y = -this.paddleSpeed;
      } else if (this.cursors.down.isDown) {
        newPaddleVelocity.y = this.paddleSpeed;
      } else if (this.myPaddle.body.velocity.y != 0) {
        this.myPaddle.setVelocityY(0);
      }

      const interpolationFactor = 0.2;
      this.myPaddle.body.velocity.lerp(newPaddleVelocity, interpolationFactor);

      this.myPaddle.setY(Phaser.Math.Clamp(this.myPaddle.y,
        this.myPaddle.height / 2 + 15,
        this.gameHeight - this.myPaddle.height / 2 - 15
      ))

      this.store.dispatch(SendMyPaddlePosition({ position: { x: this.myPaddle.x, y: this.myPaddle.y } }));
    }
  }

}
