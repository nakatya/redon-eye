import Phaser from 'phaser';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#0b0b0b');
    this.add.text(480, 220, '眼は漂う', { color: '#d8d2c4', fontSize: '64px' }).setOrigin(0.5);
    const hint = this.add.text(480, 330, 'クリックで始める', { color: '#d8d2c4', fontSize: '22px' }).setOrigin(0.5);
    this.tweens.add({ targets: hint, alpha: { from: 0.3, to: 0.9 }, duration: 1600, yoyo: true, repeat: -1 });
    this.input.once('pointerdown', () => this.scene.start('GameScene'));
  }
}
