import Phaser from 'phaser';

/** 仮の結果画面 */
export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  create(data: { collected?: number; dead?: boolean; seconds?: number }): void {
    this.cameras.main.setBackgroundColor('#0b0b0b');
    const style = { color: '#d8d2c4', fontSize: '28px' };
    this.add.text(480, 220, data.dead ? '闇に沈んだ' : 'クリア', { ...style, fontSize: '48px' }).setOrigin(0.5);
    this.add.text(480, 290, `集めた光: ${data.collected ?? 0}`, style).setOrigin(0.5);
    this.add.text(480, 325, `経過時間: ${(data.seconds ?? 0).toFixed(1)} 秒`, style).setOrigin(0.5);
    this.add.text(480, 380, 'クリックでもう一度', { ...style, fontSize: '20px' }).setOrigin(0.5);
    this.input.once('pointerdown', () => this.scene.start('GameScene'));
  }
}
