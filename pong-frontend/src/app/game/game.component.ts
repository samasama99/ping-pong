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
      width: 1300,
      height: 960,
      parent: 'game-container', // Parent element ID
      physics: {
        default: 'arcade',
        arcade: {
          // Arcade Physics configuration options...
        }
      },
      scene: [] // Register your scene(s) here
    };

  }

  ngOnInit() {
    this.store.dispatch(CreateGame());
    this.game = new Phaser.Game(this.config);
    this.gameService.createGame()
      .subscribe(payload => {
        console.log({ payload });
        const state: { gameState: GameStateType, playerNumber: PlayerNumber } = JSON.parse(payload);
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
              this.gameService.playerIsReady()
            }
            this.gameService.updateBallStateEvent();
            this.gameService.updateOpponentPaddle();
            this.gameService.updatePlayerScoreEvent();
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
            this.gameScene?.scene.stop();
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
