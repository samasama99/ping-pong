import { Component, OnInit, inject } from '@angular/core';
import { GameScene } from '../game-scene';
import Phaser, { Scene } from 'phaser';
import 'phaser3-nineslice';
import { Store } from '@ngrx/store';
import { Color, GameState, GameStateType, Player } from '../game-state/game.state';
import { Socket } from 'ngx-socket-io';
import { GameService } from '../game.service';
import { CreateGame, SetGameColor, SetPlayerNumber, UpdateBall, UpdateGameState, UpdateOpponentPosition, UpdateScore } from '../game-state/game.actions';
import { selectGameState } from '../game-state/game.selectors';
import { PositionState } from 'src/position-state';
import * as flatbuffers from 'flatbuffers';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  private game!: Phaser.Game;
  private config: Phaser.Types.Core.GameConfig;
  private gameScene!: GameScene;
  // public gameState$ = this.store.select(selectAllState);

  constructor(private store: Store<GameState>, private gameService: GameService) {
    this.config = {
      type: Phaser.AUTO,
      width: 1232,
      height: 685,
      // backgroundColor: '#103960',
      parent: 'game-container',
      physics: {
        default: 'arcade',
        arcade: {
        }
      },
      fps: {
        min: 60,
        target: 60, // set the target frame rate to 60 FPS
        deltaHistory: 10,
        smoothStep: true,
      },
      scale: {
        mode: Phaser.Scale.WIDTH_CONTROLS_HEIGHT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: 'game-container',
      },
      scene: []
    };
  }

  ngOnInit() {
    this.store.dispatch(CreateGame());
    this.game = new Phaser.Game(this.config);
    this.gameService.createGame()
      .subscribe(payload => {
        console.log({ payload });
        const state: { gameState: GameStateType, playerNumber: Player, isWin: boolean, color: Color } = JSON.parse(payload);
        if (state.gameState) {
          this.store.dispatch(UpdateGameState({ newState: state.gameState }));
        }
        if (state.playerNumber) {
          this.store.dispatch(SetPlayerNumber({ playerNumber: state.playerNumber }));
        }
        if (state.color) {
          this.store.dispatch(SetGameColor({ color: state.color }));
        }
        switch (state.gameState) {
          case GameStateType.Playing: {
            if (!this.gameScene) {
              console.log("create GameScene");
              this.gameScene = new GameScene(this.store, state.playerNumber, state.color ?? Color.White);
              this.game.scene.add('GameScene', this.gameScene);
              this.gameScene.scene.start();
              setInterval(() => {
                const startTime = Date.now();
                this.gameService.socket.emit('ping');
                this.gameService.socket.once('pong', () => {
                  const latency = Date.now() - startTime;
                  this.gameScene.pingText.setText(`Ping: ${latency}ms`);
                });
              }, 5000);
              this.gameService.updateBallStateEvent()
                .subscribe((state) => {
                  const buffer = new flatbuffers.ByteBuffer(new Uint8Array(state));
                  const ballState = PositionState.getRootAsPositionState(buffer);

                  const x = ballState.x();
                  const y = ballState.y();
                  this.store.dispatch(UpdateBall({ ball: { x, y } }));
                });
              this.gameService.updateOpponentPaddle()
                .subscribe((state) => {
                  const buffer = new flatbuffers.ByteBuffer(new Uint8Array(state));
                  const paddleState = PositionState.getRootAsPositionState(buffer);

                  const x = paddleState.x();
                  const y = paddleState.y();
                  this.store.dispatch(UpdateOpponentPosition({ position: { x, y } }));
                });
              this.gameService.updatePlayerScoreEvent()
                .subscribe((payload) => {
                  const score: {
                    player1: number, player2: number
                  } = JSON.parse(payload);
                  console.log("score parsed", score);
                  this.store.dispatch(UpdateScore({ score }));
                })
              this.gameService.playerIsReady()
            }
            break;
          }
          case GameStateType.Finished: {
            if (this.gameScene) {
              console.log("game Finished")
              this.gameScene.win.setVisible(true);
              this.gameScene.winText.setText(state.isWin ? "WON" : "LOST");
              this.gameScene.physics.pause();
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
