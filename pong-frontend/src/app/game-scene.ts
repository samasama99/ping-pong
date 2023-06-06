import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'game' });
  }

  preload() {
    console.log('preload method');
  }

  create() {
    // Set up game objects and initial state here
    console.log('create method');
  }

  override update() {
    // Update game state in the game loop here
    console.log('update method');
  }
}
