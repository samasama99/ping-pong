import Phaser from 'phaser';
import 'phaser3-nineslice';
import { Store } from '@ngrx/store';
import { CreateGame, SendMyPaddleState, StartGame, } from './game-state/game.actions'
import { GameState, GameStateType, PaddleState, PlayerNumber } from './game-state/game.state';
import { Game } from "phaser";
import { selectBallState, selectGameState, selectOpponentPaddleState, selectPlayerNumber } from './game-state/game.selectors';


export class GameScene extends Phaser.Scene {
  readonly paddleSpeed: number = 950; // Adjust the paddle speed as needed
  readonly inital_ball_speed = 650;

  private wallUp!: Phaser.Physics.Arcade.Image;
  private wallDown!: Phaser.Physics.Arcade.Image;

  private myPaddle!: Phaser.Physics.Arcade.Image;
  private opponentPaddle!: Phaser.Physics.Arcade.Image;

  private ball!: Phaser.Physics.Arcade.Image;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  // private scoreText1!: Phaser.GameObjects.Text;
  // private scoreText2!: Phaser.GameObjects.Text;

  // private winTextPlayer1!: Phaser.GameObjects.Text;
  // private winTextPlayer2!: Phaser.GameObjects.Text;

  private gameHeight = 0;
  private gameWidth = 0;
  private respawnDelayTimer: Phaser.Time.TimerEvent | undefined;
  // private store: Store<GameState>;

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
    this.load.image('paddle', '../assets/paddle.png');
    this.load.image('ball', '../assets/ball.png');
    this.load.image('wall', '../assets/wall.png');
  }

  // private getRandomNumber(min: number, max: number) {
  //   return Phaser.Math.Between(min, max)
  // }

  setupGameObject() {
    switch (this.playerNumber) {
      case PlayerNumber.PlayerOne:
        {
          console.log("init control PlayerOne")
          this.myPaddle = this.physics.add.image(0.05 * this.gameWidth, this.gameHeight / 2, 'paddle');
          this.opponentPaddle = this.physics.add.image(this.gameWidth - (0.0695 * this.gameWidth), this.gameHeight / 2, 'paddle');
          break;
        }
      case PlayerNumber.PlayerTwo:
        {
          console.log("init control PlayerTwo")
          this.myPaddle = this.physics.add.image(this.gameWidth - (0.0695 * this.gameWidth), this.gameHeight / 2, 'paddle');
          this.opponentPaddle = this.physics.add.image(0.05 * this.gameWidth, this.gameHeight / 2, 'paddle');
          break;
        }
      default:
        console.log("default")
    }

    this.ball = this.physics.add.image(this.gameWidth / 2, this.gameHeight / 2, 'ball');

    this.wallUp = this.physics.add.image(650, 15, 'wall');
    this.wallDown = this.physics.add.image(650, this.gameHeight - 15, 'wall');
  }

  setupGamePhysics() {
    this.physics.world.enable([this.myPaddle, this.opponentPaddle, this.ball, this.wallDown, this.wallUp]);

    this.myPaddle.setCollideWorldBounds(true);
    this.myPaddle.setImmovable(true);

    this.opponentPaddle.setCollideWorldBounds(true);
    this.opponentPaddle.setImmovable(true);



    this.wallDown.setCollideWorldBounds(true);
    this.wallDown.setImmovable(true);

    this.wallUp.setCollideWorldBounds(true);
    this.wallUp.setImmovable(true);

    this.physics.add.collider(this.ball, [this.myPaddle, this.opponentPaddle], undefined, undefined, this);
    this.physics.add.collider(this.ball, [this.wallUp, this.wallDown], undefined, undefined, this);

    this.ball.setBounce(1);
    this.ball.setPushable(false);
  }

  // initText() {
  //   this.winTextPlayer1 = this.add.text(400, 150, '', { fontSize: '128px', fill: '#fff' } as Phaser.Types.GameObjects.Text.TextStyle);
  //   this.winTextPlayer2 = this.add.text(900, 150, '', { fontSize: '128px', fill: '#fff' } as Phaser.Types.GameObjects.Text.TextStyle);
  //   this.scoreText1 = this.add.text(475, 50, '0', { fontSize: '128px', fill: '#fff' } as Phaser.Types.GameObjects.Text.TextStyle);
  //   this.scoreText2 = this.add.text(this.gameWidth - 475, 50, '0', { fontSize: '128px', fill: '#fff' } as Phaser.Types.GameObjects.Text.TextStyle).setOrigin(1, 0);
  // }

  create() {
    this.gameHeight = this.sys.canvas.height;
    this.gameWidth = this.sys.canvas.width;
    this.cursors = this.input?.keyboard?.createCursorKeys()!;
    this.setupGameObject();
    this.setupGamePhysics();


    this.store.select(selectOpponentPaddleState).subscribe(paddleState => {
      console.log("select player2 moved", paddleState);
      switch (paddleState) {
        case PaddleState.Down:
          {
            this.opponentPaddle.setVelocityY(this.paddleSpeed);
            break;
          }
        case PaddleState.Up:
          {
            this.opponentPaddle.setVelocityY(-this.paddleSpeed);
            break;
          }
        default:
          this.opponentPaddle.setVelocityY(0);
      }
    })
    this.store.select(selectBallState).subscribe(ballState => {
      const { position, velocity } = ballState;
      this.ball.setPosition(position.x, position.y);
      this.ball.setVelocity(velocity.x, velocity.y);
    })
    // this.initText();
  }

  override update() {
    if (this.myPaddle.body?.velocity) {
      if (this.cursors.up.isDown) {
        this.myPaddle.setVelocityY(-this.paddleSpeed);
        this.store.dispatch(SendMyPaddleState({ paddleState: PaddleState.Up }))
      } else if (this.cursors.down.isDown) {
        this.myPaddle.setVelocityY(this.paddleSpeed);
        this.store.dispatch(SendMyPaddleState({ paddleState: PaddleState.Down }))
      } else {
        if (this.myPaddle.body.velocity.y != 0) {
          this.store.dispatch(SendMyPaddleState({ paddleState: PaddleState.Stil }))
          this.myPaddle.setVelocityY(0);
        }
      }
    }
  }

  //   }
  // }


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
}
