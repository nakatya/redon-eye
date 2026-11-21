import Phaser from 'phaser';
import { Eye } from '../entities/Eye';

export const STAGE = { width: 960 * 3, height: 540 * 3 };

export class GameScene extends Phaser.Scene {
  private eye!: Eye;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;

  constructor() {
    super('GameScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#0b0b0b');
    this.cameras.main.setBounds(0, 0, STAGE.width, STAGE.height);
    this.eye = new Eye(this, STAGE.width / 2, STAGE.height / 2);
    this.cameras.main.startFollow(this.eye, true, 0.08, 0.08);

    const kb = this.input.keyboard!;
    this.cursors = kb.createCursorKeys();
    this.wasd = kb.addKeys('W,A,S,D') as typeof this.wasd;
  }

  update(_time: number, delta: number): void {
    const left = this.cursors.left.isDown || this.wasd.A.isDown;
    const right = this.cursors.right.isDown || this.wasd.D.isDown;
    const up = this.cursors.up.isDown || this.wasd.W.isDown;
    const down = this.cursors.down.isDown || this.wasd.S.isDown;
    this.eye.step(
      { x: Number(right) - Number(left), y: Number(down) - Number(up) },
      Math.min(delta, 50) / 1000,
      STAGE,
    );
  }
}
