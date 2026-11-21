import Phaser from 'phaser';
import { COLOR, CSS } from '../palette';
import { createGround } from '../entities/Ground';
import { Eye } from '../entities/Eye';
import { pointerInput } from '../logic/pointer';
import { Vision } from '../entities/Vision';
import { Mote } from '../entities/Mote';
import { Shade } from '../entities/Shade';
import { formatElapsed } from '../logic/time';
import { applyCharcoal } from '../shaders/CharcoalPipeline';
import { SHADE_COUNT, placeShades } from '../logic/shade';
import { MAX_HEALTH, applyHit, blinkVisible, hitsShade, initialHealth, isDead, tickHealth, type HealthState } from '../logic/health';
import { SHADE_RADIUS } from '../logic/shade';
import {
  EXIT_RADIUS, MOTE_COUNT, MOTE_GOAL, collectedIndices, isExitOpen, placeMotes, reachedExit, visionRadiusFor,
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
  private timerText!: Phaser.GameObjects.Text;
  private cleared = false;
  private shades: Shade[] = [];
  private health: HealthState = initialHealth();
  private hearts: Phaser.GameObjects.Container[] = [];
  private startTime = 0;
  private pointerHeldAtStart = false;
  // 毎フレームの生成を避けるため使い回す
  private pointerWorld = new Phaser.Math.Vector2();
  private eyePos = new Phaser.Math.Vector2();
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;

  constructor() {
    super('GameScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor(CSS.dark);
    this.cameras.main.setBounds(0, 0, STAGE.width, STAGE.height);
    applyCharcoal(this);
    createGround(this, STAGE);
    // 確認用の目印(後の Issue で置き換えてよい)
    const rnd = new Phaser.Math.RandomDataGenerator(['marks']);
    for (let i = 0; i < 40; i++) {
      const x = rnd.between(60, STAGE.width - 60);
      const y = rnd.between(60, STAGE.height - 60);
      this.add.circle(x, y, rnd.between(6, 14), COLOR.mid);
    }
    this.eye = new Eye(this, STAGE.width / 2, STAGE.height / 2);
    this.vision = new Vision(this, STAGE);
    this.taken = new Set();
    this.cleared = false;
    this.exit = undefined;
    this.moteSpots = placeMotes(MOTE_COUNT, STAGE, { x: this.eye.x, y: this.eye.y }, Math.random);
    this.motes = this.moteSpots.map((p) => new Mote(this, p.x, p.y));
    this.shades = placeShades(SHADE_COUNT, STAGE, { x: this.eye.x, y: this.eye.y }, Math.random).map(
      (p) => new Shade(this, p.x, p.y),
    );
    this.health = initialHealth();
    this.startTime = this.time.now;
    this.createHearts();
    this.counter = this.add
      .text(16, 12, '', { color: CSS.paper, fontSize: '22px' })
      .setScrollFactor(0)
      .setDepth(200);
    this.timerText = this.add
      .text(16, 40, '', { color: CSS.dim, fontSize: '16px' })
      .setScrollFactor(0)
      .setDepth(200);
    this.refreshCounter();
    this.cameras.main.startFollow(this.eye, true, 0.08, 0.08);

    const kb = this.input.keyboard!;
    this.cursors = kb.createCursorKeys();
    this.wasd = kb.addKeys('W,A,S,D') as typeof this.wasd;
    // タイトル/結果画面の pointerdown で始まるため、押されたままなら離されるまでポインタ入力を無視
    this.pointerHeldAtStart = this.input.activePointer.isDown;
  }

  update(_time: number, delta: number): void {
    const left = this.cursors.left.isDown || this.wasd.A.isDown;
    const right = this.cursors.right.isDown || this.wasd.D.isDown;
    const up = this.cursors.up.isDown || this.wasd.W.isDown;
    const down = this.cursors.down.isDown || this.wasd.S.isDown;
    const key = { x: Number(right) - Number(left), y: Number(down) - Number(up) };
    let input = key;
    // キーボード入力がない間だけ、押している(触れている)ポインタへ漂う
    if (key.x === 0 && key.y === 0) {
      const ptr = this.input.activePointer;
      // 開始時に押されていた指・ボタンは、一度離されるまで無視する
      if (!ptr.isDown) this.pointerHeldAtStart = false;
      if (ptr.isDown && !this.pointerHeldAtStart) {
        // カメラのスクロールを考慮してワールド座標へ変換
        const w = this.cameras.main.getWorldPoint(ptr.x, ptr.y, this.pointerWorld);
        this.eyePos.set(this.eye.x, this.eye.y);
        input = pointerInput(this.eyePos, w, this.eye.getVelocity());
      }
    } else if (!this.input.activePointer.isDown) {
      this.pointerHeldAtStart = false;
    }
    this.eye.step(
      input,
      Math.min(delta, 50) / 1000,
      STAGE,
    );
    const eyePos = { x: this.eye.x, y: this.eye.y };
    for (const i of collectedIndices(eyePos, this.moteSpots, this.taken)) {
      this.taken.add(i);
      this.motes[i].destroy();
    }
    this.vision.radius = visionRadiusFor(this.taken.size);
    const dt = Math.min(delta, 50);
    for (const sh of this.shades) {
      sh.step(eyePos, this.vision.radius, dt / 1000, STAGE);
      // 視界に入っている(=見えている)ときだけ現れる。闇のオーバーレイが隠すので描画はそのまま
      if (hitsShade(eyePos, sh, SHADE_RADIUS)) this.health = applyHit(this.health);
    }
    this.health = tickHealth(this.health, dt);
    this.eye.setAlpha(blinkVisible(this.health.invincibleMs) ? 1 : 0.25);
    this.refreshHearts();
    if (isDead(this.health) && !this.cleared) {
      this.cleared = true;
      this.scene.start('GameOverScene', {
        collected: this.taken.size,
        dead: true,
        seconds: (this.time.now - this.startTime) / 1000,
      });
      return;
    }
    this.refreshCounter();
    this.timerText.setText(formatElapsed((this.time.now - this.startTime) / 1000));
    if (!this.exit && isExitOpen(this.taken.size)) this.spawnExit();
    if (this.exit && !this.cleared && reachedExit(eyePos, this.exit)) {
      this.cleared = true;
      this.scene.start('GameOverScene', { collected: this.taken.size, dead: false, seconds: (this.time.now - this.startTime) / 1000 });
    }
    this.vision.update(this.eye.x, this.eye.y);
  }

  private createHearts(): void {
    this.hearts = [];
    for (let i = 0; i < MAX_HEALTH; i++) {
      const white = this.add.ellipse(0, 0, 28, 18, COLOR.paper).setStrokeStyle(1, COLOR.mid);
      const pupil = this.add.circle(0, 0, 5, COLOR.dark);
      const icon = this.add.container(960 - 30 - i * 36, 24, [white, pupil]).setScrollFactor(0).setDepth(200);
      this.hearts.push(icon);
    }
  }

  private refreshHearts(): void {
    // 右端から消えていく
    this.hearts.forEach((h, i) => h.setAlpha(i < this.health.hp ? 1 : 0.15));
  }

  private refreshCounter(): void {
    this.counter.setText(`${this.taken.size} / ${MOTE_GOAL}`);
  }

  private spawnExit(): void {
    // 開始地点から離れた位置に出す
    const [p] = placeMotes(1, STAGE, { x: this.eye.x, y: this.eye.y }, Math.random, { startDist: 600 });
    const pos = p ?? { x: 200, y: 200 };
    this.exit = this.add.circle(pos.x, pos.y, EXIT_RADIUS, COLOR.paper, 0.35);
    this.tweens.add({ targets: this.exit, alpha: { from: 0.15, to: 0.5 }, duration: 1400, yoyo: true, repeat: -1 });
  }
}
