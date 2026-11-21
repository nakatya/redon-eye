import Phaser from 'phaser';
import { CSS } from '../palette';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor(CSS.dark);
    this.add.text(480, 220, '眼は漂う', { color: CSS.paper, fontSize: '64px' }).setOrigin(0.5);
    const hint = this.add.text(480, 330, 'クリックで始める', { color: CSS.paper, fontSize: '22px' }).setOrigin(0.5);
    this.tweens.add({ targets: hint, alpha: { from: 0.3, to: 0.9 }, duration: 1600, yoyo: true, repeat: -1 });
    this.input.once('pointerdown', () => this.scene.start('GameScene'));
  }
}
