import { Component, OnInit, inject } from '@angular/core';
import { GameScene } from '../game-scene';
import Phaser, { Scene } from 'phaser';
import 'phaser3-nineslice';
import { Store } from '@ngrx/store';
import { GameState, GameStateType, PlayerNumber } from '../game-state/game.state';
import { Socket } from 'ngx-socket-io';
import { GameService } from '../game.service';
import { CreateGame, SetPlayerNumber, UpdateGameState } from '../game-state/game.actions';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  private game!: Phaser.Game;
  private config: Phaser.Types.Core.GameConfig;
  private store: Store<GameState> = inject(Store);
  private gameScene!: GameScene;

  constructor(private gameService: GameService) {
    this.config = {
      type: Phaser.AUTO,
      width: 1232,
      height: 685,
      parent: 'game-container',
      backgroundColor: '#103960',
      physics: {
        default: 'arcade',
        arcade: {
        }
      },
      scale: {
        mode: Phaser.Scale.WIDTH_CONTROLS_HEIGHT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        // parent: 'game-container',
        width: 1232,
        height: 685
      },
      // scale: {
      //   // Or set parent divId here
      //   // parent: 'game-container',

      //   // mode: Phaser.Scale.FIT,
      //   // autoCenter: Phaser.Scale.CENTER_BOTH,

      //   // Or put game size here
      //   // width: 1024,
      //   // height: 768,

      //   // Minimum size
      //   // min: {
      //   //   width: 1232 / 5,
      //   //   height: 685 / 5
      //   // },
      //   // Or set minimum size like these
      //   // minWidth: 800,
      //   // minHeight: 600,

      //   // Maximum size
      //   // max: {
      //   //   width: 1232,
      //   //   height: 685
      //   // },
      //   // Or set maximum size like these
      //   // maxWidth: 1600,
      //   // maxHeight: 1200,

      //   zoom: 1,  // Size of game canvas = game size * zoom
      // },
      // // autoRound: false,
      scene: []
    };

  }

  ngOnInit() {
    this.store.dispatch(CreateGame());
    this.game = new Phaser.Game(this.config);
    this.gameService.createGame()
      .subscribe(payload => {
        console.log({ payload });
        const state: { gameState: GameStateType, playerNumber: PlayerNumber, isWin: boolean } = JSON.parse(payload);
        if (state.gameState) {
          this.store.dispatch(UpdateGameState({ newState: state.gameState }));
        }
        if (state.playerNumber) {
          this.store.dispatch(SetPlayerNumber({ playerNumber: state.playerNumber }));
        }
        switch (state.gameState) {
          case GameStateType.Playing: {
            if (!this.gameScene) {
              console.log("create GameScene");
              this.gameScene = new GameScene(this.store, state.playerNumber);
              this.game.scene.add('GameScene', this.gameScene);
              this.gameScene.scene.start();
              this.gameService.updateBallStateEvent();
              this.gameService.updateOpponentPaddle();
              this.gameService.updatePlayerScoreEvent();
              this.gameService.playerIsReady()
            }
            break;
          }
          // case GameStateType.Created:
          // case GameStateType.NotCreated:
          // case GameStateType.Waiting:
          case GameStateType.Pause: {
            this.gameScene?.scene.stop();
            break;
          }
          case GameStateType.Queue:
          case GameStateType.Finished: {
            if (this.gameScene) {
              console.log("game Finished")
              this.gameScene.win.setVisible(true);
              // this.gameScene.star.setVisible(true);

              this.gameScene.winText.setText(state.isWin ? "WON" : "LOST");
              // this.gameScene?.scene.stop();
            } else {
              console.log("ABORT")
            }
            break;
          }
          default: {
            //statements;
            break;
          }
        }
      })

  }
}
