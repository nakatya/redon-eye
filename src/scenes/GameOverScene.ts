import Phaser from 'phaser';

/** 仮の結果画面 */
export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  create(data: { collected?: number }): void {
    this.cameras.main.setBackgroundColor('#0b0b0b');
    const style = { color: '#d8d2c4', fontSize: '28px' };
    this.add.text(480, 220, 'クリア', { ...style, fontSize: '48px' }).setOrigin(0.5);
    this.add.text(480, 290, `集めた光: ${data.collected ?? 0}`, style).setOrigin(0.5);
    this.add.text(480, 360, 'クリックでもう一度', { ...style, fontSize: '20px' }).setOrigin(0.5);
    this.input.once('pointerdown', () => this.scene.start('GameScene'));
  }
}
