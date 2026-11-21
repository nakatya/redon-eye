import Phaser from 'phaser';
import { COLOR } from '../palette';
import { DEFAULT_MOVEMENT, moveWithin, pupilOffset, stepVelocity, type Vec2 } from '../logic/movement';

const RX = 28;
const RY = 18;
const PUPIL_R = 9;

export class Eye extends Phaser.GameObjects.Container {
  private velocity: Vec2 = { x: 0, y: 0 };
  private pupil: Phaser.GameObjects.Arc;
  private pupilPos: Vec2 = { x: 0, y: 0 };

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    const white = scene.add.ellipse(0, 0, RX * 2, RY * 2, COLOR.paper);
    white.setStrokeStyle(2, COLOR.mid);
    this.pupil = scene.add.circle(0, 0, PUPIL_R, COLOR.dark);
    this.add([white, this.pupil]);
    scene.add.existing(this);
  }

  step(input: Vec2, dtSec: number, bounds: { width: number; height: number }): void {
    this.velocity = stepVelocity(this.velocity, input, dtSec);
    const r = moveWithin({ x: this.x, y: this.y }, this.velocity, dtSec, bounds, RX);
    this.velocity = r.vel;
    this.setPosition(r.pos.x, r.pos.y);

    // 瞳をなめらかに目標位置へ寄せる
    const o = pupilOffset(this.velocity, DEFAULT_MOVEMENT.maxSpeed);
    const tx = o.x * (RX - PUPIL_R - 3);
    const ty = o.y * (RY - PUPIL_R + 3);
    const k = 1 - Math.exp(-10 * dtSec);
    this.pupilPos = { x: this.pupilPos.x + (tx - this.pupilPos.x) * k, y: this.pupilPos.y + (ty - this.pupilPos.y) * k };
    this.pupil.setPosition(this.pupilPos.x, this.pupilPos.y);
  }
}
