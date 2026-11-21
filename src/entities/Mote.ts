import Phaser from 'phaser';
import { MOTE_RADIUS } from '../logic/motes';

/** 小さく淡く明滅する光の点 */
export class Mote extends Phaser.GameObjects.Arc {
  private pulse: Phaser.Tweens.Tween;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, MOTE_RADIUS, 0, 360, false, 0xd8d2c4, 0.8);
    scene.add.existing(this);
    this.pulse = scene.tweens.add({
      targets: this,
      alpha: { from: 0.3, to: 1 },
      duration: 900 + Math.random() * 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  /** 淡く消えてから破棄する */
  fadeOutAndDestroy(duration = 300): void {
    this.pulse.stop();
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration,
      onComplete: () => this.destroy(),
    });
  }

  destroy(fromScene?: boolean): void {
    // 破棄済みの対象を更新し続けないよう、紐づく tween を止める
    this.scene?.tweens.killTweensOf(this);
    super.destroy(fromScene);
  }
}
