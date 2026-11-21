import Phaser from 'phaser';
import { Eye } from '../entities/Eye';
import { Vision } from '../entities/Vision';
import { Mote } from '../entities/Mote';
import {
  EXIT_RADIUS, MOTE_COUNT, MOTE_GOAL, collectedIndices, exitAlphaFor, isExitOpen, placeExit, placeMotes, reachedExit, visionRadiusFor,
} from '../logic/motes';

export const STAGE = { width: 960 * 3, height: 540 * 3 };

export class GameScene extends Phaser.Scene {
  private eye!: Eye;
  /** 視界の半径は vision.radius で変更できる */
  vision!: Vision;
  private motes: Mote[] = [];
  private moteSpots: { x: number; y: number }[] = [];
  private taken = new Set<number>();
  private exit?: Phaser.GameObjects.Arc;
  private counter!: Phaser.GameObjects.Text;
  private cleared = false;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;

  constructor() {
    super('GameScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#0b0b0b');
    this.cameras.main.setBounds(0, 0, STAGE.width, STAGE.height);
    // 確認用の目印(後の Issue で置き換えてよい)
    const rnd = new Phaser.Math.RandomDataGenerator(['marks']);
    for (let i = 0; i < 40; i++) {
      const x = rnd.between(60, STAGE.width - 60);
      const y = rnd.between(60, STAGE.height - 60);
      this.add.circle(x, y, rnd.between(6, 14), 0x6b6b6b);
    }
    this.eye = new Eye(this, STAGE.width / 2, STAGE.height / 2);
    this.vision = new Vision(this, STAGE);
    this.taken = new Set();
    this.cleared = false;
    this.exit = undefined;
    this.moteSpots = placeMotes(MOTE_COUNT, STAGE, { x: this.eye.x, y: this.eye.y }, Math.random);
    this.motes = this.moteSpots.map((p) => new Mote(this, p.x, p.y));
    this.counter = this.add
      .text(16, 12, '', { color: '#d8d2c4', fontSize: '22px' })
      .setScrollFactor(0)
      .setDepth(200);
    this.refreshCounter();
    this.cameras.main.startFollow(this.eye, true, 0.08, 0.08);

    const kb = this.input.keyboard!;
    this.cursors = kb.createCursorKeys();
    this.wasd = kb.addKeys('W,A,S,D') as typeof this.wasd;
  }

  update(time: number, delta: number): void {
    const left = this.cursors.left.isDown || this.wasd.A.isDown;
    const right = this.cursors.right.isDown || this.wasd.D.isDown;
    const up = this.cursors.up.isDown || this.wasd.W.isDown;
    const down = this.cursors.down.isDown || this.wasd.S.isDown;
    this.eye.step(
      { x: Number(right) - Number(left), y: Number(down) - Number(up) },
      Math.min(delta, 50) / 1000,
      STAGE,
    );
    const eyePos = { x: this.eye.x, y: this.eye.y };
    const picked = collectedIndices(eyePos, this.moteSpots, this.taken);
    for (const i of picked) {
      this.taken.add(i);
      this.motes[i].fadeOutAndDestroy();
    }
    if (picked.length > 0) this.refreshCounter();
    this.vision.radius = visionRadiusFor(this.taken.size);
    if (!this.exit && isExitOpen(this.taken.size)) this.spawnExit();
    if (this.exit && !this.cleared && reachedExit(eyePos, this.exit)) {
      this.cleared = true;
      this.scene.start('GameOverScene', { collected: this.taken.size });
    }
    if (this.exit) {
      const d = Math.hypot(this.exit.x - eyePos.x, this.exit.y - eyePos.y);
      this.exit.setAlpha(exitAlphaFor(d, Math.sin(time / 700)));
    }
    this.vision.update(this.eye.x, this.eye.y);
  }

  private refreshCounter(): void {
    this.counter.setText(`${this.taken.size} / ${MOTE_GOAL}`);
  }

  private spawnExit(): void {
    const pos = placeExit(STAGE, { x: this.eye.x, y: this.eye.y }, Math.random);
    // 視界オーバーレイ(depth 100)より上に描き、暗闇の中でも遠くにぼんやり見えるようにする
    this.exit = this.add.circle(pos.x, pos.y, EXIT_RADIUS, 0xd8d2c4, 0.2).setDepth(150);
  }
}
