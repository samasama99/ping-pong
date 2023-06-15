import Phaser from 'phaser';
import 'phaser3-nineslice';
import { Store } from '@ngrx/store';
import { SendMyPaddlePosition, StartGame, } from './game-state/game.actions'
import { GameState, PlayerNumber } from './game-state/game.state';
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
  public star!: Phaser.GameObjects.Image;
  public win!: Phaser.GameObjects.Image;
  public background!: Phaser.GameObjects.Image;

  public winText!: Phaser.GameObjects.Text;

  private gameHeight = 0;
  private gameWidth = 0;


  constructor(private store: Store<GameState>, private playerNumber: PlayerNumber) {
    super({ key: 'game' });
    console.log("constructor", playerNumber)
  }

  init() {
    console.log("init")
    this.store.dispatch(StartGame());
    console.log("Player Number", this.playerNumber);
  }

  preload() {
    this.load.image('background', 'assets/background.png');
    this.load.image('paddle', '../assets/paddle.png');
    this.load.image('ball', '../assets/ball.png');
    this.load.image('line', '../assets/line.png');
    this.load.image('star', '../assets/star.png');
    this.load.image('win', '../assets/win.png');
  }

  // private getRandomNumber(min: number, max: number) {
  //   return Phaser.Math.Between(min, max)
  // }

  setupGameObject() {
    switch (this.playerNumber) {
      case PlayerNumber.PlayerOne:
        {
          console.log("init control PlayerOne")
          this.myPaddle = this.physics.add.image(27, this.gameHeight / 2, 'paddle');
          this.opponentPaddle = this.physics.add.image(this.gameWidth - 27, this.gameHeight / 2, 'paddle');
          break;
        }
      case PlayerNumber.PlayerTwo:
        {
          console.log("init control PlayerTwo")
          this.myPaddle = this.physics.add.image(this.gameWidth - 27, this.gameHeight / 2, 'paddle');
          this.opponentPaddle = this.physics.add.image(27, this.gameHeight / 2, 'paddle');
          break;
        }
      default:
        console.log("default")
    }


    this.ball = this.add.image(this.gameWidth / 2, this.gameHeight / 2, 'ball');
    this.win = this.add.image(this.gameWidth / 2, this.gameHeight / 2, 'win').setVisible(false);
    this.star = this.add.image(this.gameWidth / 2, this.gameHeight / 2, 'star').setVisible(false);

    this.star.displayWidth = 784.57; // Set the width to 100 pixels
    this.star.displayHeight = 523.05; //

    this.star.setDepth(1);
    // this.wallUp = this.physics.add.image(650, 15, 'wall');
    // this.wallDown = this.physics.add.image(650, this.gameHeight - 15, 'wall');
  }

  initText() {
    // this.winTextPlayer1 = this.add.text(400, 150, '', { fontSize: '128px', fill: '#fff' } as Phaser.Types.GameObjects.Text.TextStyle);
    // this.winTextPlayer2 = this.add.text(900, 150, '', { fontSize: '128px', fill: '#fff' } as Phaser.Types.GameObjects.Text.TextStyle);
    //
    this.winText = this.add.text(this.gameWidth / 2 - 225, this.gameHeight / 2 - 100, '', { fontSize: '169px', fill: '#fff', fontFamily: 'Montserrat' } as Phaser.Types.GameObjects.Text.TextStyle);
    this.scoreText1 = this.add.text(555, 20, '0', { fontSize: '40px', fill: '#fff', fontFamily: 'Montserrat' } as Phaser.Types.GameObjects.Text.TextStyle);
    this.scoreText2 = this.add.text(this.gameWidth - 555, 20, '0', { fontSize: '40px', fill: '#fff', fontFamily: 'Montserrat' } as Phaser.Types.GameObjects.Text.TextStyle).setOrigin(1, 0);
  }

  create() {
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
        // console.log(position)
        this.opponentPaddle.setY(position.x);
        this.opponentPaddle.setY(position.y);
      });

    this.store.select(selectBallState)
      .subscribe(ballState => {
        this.ball.setPosition(ballState.x, ballState.y);
      });

    this.store.select(selectPlayerScore)
      .subscribe(score => {
        this.playerScore1 = score.player1;
        this.playerScore2 = score.player2;
        this.scoreText1.setText(`${this.playerScore1}`)
        this.scoreText2.setText(`${this.playerScore2}`)
      });
  }

  override update() {
    // if (window.innerWidth < this.gameWidth + 100) {
    //   this.gameHeight = this.sys.canvas.height;
    //   this.gameWidth = this.sys.canvas.width;
    // }
    this.store.dispatch(SendMyPaddlePosition({ position: { x: this.myPaddle.x, y: this.myPaddle.y } }));
    if (this.myPaddle.body?.velocity) {
      if (this.cursors.up.isDown && this.myPaddle.y - this.myPaddle.height > -29.5) {
        this.myPaddle.setVelocityY(-this.paddleSpeed);
      } else if (this.cursors.down.isDown && this.myPaddle.y + this.myPaddle.height < this.gameHeight + 29.5) {
        this.myPaddle.setVelocityY(this.paddleSpeed);
      } else if (this.myPaddle.body.velocity.y != 0) {
        this.myPaddle.setVelocityY(0);
      }
    }
  }

}
