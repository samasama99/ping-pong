import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
  private paddle!: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: 'game' });
  }

  preload() {
    console.log('preload method');
  }

  create() {
    // Set up game objects and initial state here
    console.log('create method');
    this.paddle = this.add.graphics();
    this.paddle.fillStyle(0xff0000);
    this.paddle.fillRect(0, 0, 10, 10);
    this.paddle.x = 100;
    this.paddle.y = 100;
  }

  override update() {
    // Update game state in the game loop here
    console.log('update method');
  }
}
