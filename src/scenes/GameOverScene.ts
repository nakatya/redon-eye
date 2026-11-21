import Phaser from 'phaser';
import { CSS } from '../palette';
import { formatElapsed } from '../logic/time';

/** 結果画面(クリア / ゲームオーバー) */
export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  create(data: { collected?: number; dead?: boolean; seconds?: number }): void {
    this.cameras.main.setBackgroundColor(CSS.dark);
    const style = { color: CSS.paper, fontSize: '28px' };
    this.add.text(480, 220, data.dead ? '闇に沈んだ' : 'クリア', { ...style, fontSize: '48px' }).setOrigin(0.5);
    this.add.text(480, 290, `集めた光: ${data.collected ?? 0}`, style).setOrigin(0.5);
    this.add.text(480, 325, `経過時間: ${formatElapsed(data.seconds ?? 0)}`, style).setOrigin(0.5);
    const again = this.add.text(480, 380, 'もう一度', { ...style, fontSize: '24px' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    again.on('pointerdown', () => this.scene.start('GameScene'));
  }
}
