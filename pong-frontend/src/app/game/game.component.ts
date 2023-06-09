import { Component, OnInit, inject } from '@angular/core';
import { GameScene } from '../game-scene';
import Phaser from 'phaser';
import 'phaser3-nineslice';
import { Store } from '@ngrx/store';
import { GameState } from '../game-state/game.state';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  private game!: Phaser.Game;
  private config: Phaser.Types.Core.GameConfig;
  private store: Store<GameState> = inject(Store);

  constructor() {
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
      scene: [GameScene] // Register your scene(s) here
    };

  }

  ngOnInit() {
    this.game = new Phaser.Game(this.config);
    let gameScene = new GameScene(this.store);
    this.game.scene.add('GameScene', gameScene);
  }
}
