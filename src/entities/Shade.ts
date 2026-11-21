import Phaser from 'phaser';
import { COLOR } from '../palette';
import { SHADE_RADIUS, clampToStage, shadeVelocity } from '../logic/shade';

/** 輪郭のぼやけた黒い不定形。ゆらゆら揺れる */
export class Shade extends Phaser.GameObjects.Container {
  private angle0 = Math.random() * Math.PI * 2;
  private turnTimer = 0;
  private blobs: Phaser.GameObjects.Arc[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    // 大きさの違う半透明の円を重ねて、ぼやけた輪郭を作る
    for (const [s, a] of [[1.35, 0.15], [1.15, 0.25], [0.95, 0.5], [0.7, 0.95]] as const) {
      const c = scene.add.circle(0, 0, SHADE_RADIUS * s, COLOR.black, a);
      this.blobs.push(c);
      this.add(c);
    }
    scene.add.existing(this);
    this.setDepth(10);
    scene.tweens.add({
      targets: this.blobs,
      scaleX: { from: 0.9, to: 1.12 },
      scaleY: { from: 1.1, to: 0.88 },
      duration: 1100 + Math.random() * 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  step(eye: { x: number; y: number }, visionRadius: number, dtSec: number, world: { width: number; height: number }): void {
    this.turnTimer -= dtSec;
    if (this.turnTimer <= 0) {
      this.angle0 += (Math.random() - 0.5) * 2;
      this.turnTimer = 1.5 + Math.random() * 2;
    }
    const v = shadeVelocity(this, eye, visionRadius, this.angle0);
    const p = clampToStage({ x: this.x + v.x * dtSec, y: this.y + v.y * dtSec }, world);
    if (p.x !== this.x + v.x * dtSec || p.y !== this.y + v.y * dtSec) this.angle0 += Math.PI; // 壁で反転
    this.setPosition(p.x, p.y);
  }
}
