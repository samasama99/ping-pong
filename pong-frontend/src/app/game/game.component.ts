import { Component, OnInit } from '@angular/core';
import { GameScene } from '../game-scene';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  private game!: Phaser.Game;
  private config: Phaser.Types.Core.GameConfig;

  constructor() {
    this.config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: 'game-container', // Parent element ID
      scene: [GameScene] // Register your scene(s) here
    };

  }

  ngOnInit() {
    this.game = new Phaser.Game(this.config);
  }
}
