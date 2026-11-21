import Phaser from 'phaser';
import { COLOR } from '../palette';
import { DEFAULT_VISION_RADIUS, darknessAt } from '../logic/vision';

const TEX_KEY = 'vision-gradient';
const TEX_R = 256; // グラデーションテクスチャの半径(px)。表示時に radius へスケールする

/** 目の周囲だけを見せる闇のオーバーレイ。テクスチャは一度だけ生成し、毎フレームは位置とスケールのみ更新する。 */
export class Vision {
  radius: number;
  private spot: Phaser.GameObjects.Image;
  private rects: Phaser.GameObjects.Rectangle[];

  constructor(private scene: Phaser.Scene, private world: { width: number; height: number }, radius = DEFAULT_VISION_RADIUS) {
    this.radius = radius;
    if (!scene.textures.exists(TEX_KEY)) {
      const tex = scene.textures.createCanvas(TEX_KEY, TEX_R * 2, TEX_R * 2)!;
      const ctx = tex.getContext();
      const img = ctx.createImageData(TEX_R * 2, TEX_R * 2);
      for (let y = 0; y < TEX_R * 2; y++) {
        for (let x = 0; x < TEX_R * 2; x++) {
          const a = darknessAt(Math.hypot(x + 0.5 - TEX_R, y + 0.5 - TEX_R), TEX_R);
          const i = (y * TEX_R * 2 + x) * 4;
          img.data[i] = (COLOR.dark >> 16) & 255;
          img.data[i + 1] = (COLOR.dark >> 8) & 255;
          img.data[i + 2] = COLOR.dark & 255;
          img.data[i + 3] = Math.round(a * 255);
        }
      }
      ctx.putImageData(img, 0, 0);
      tex.refresh();
    }
    this.spot = scene.add.image(0, 0, TEX_KEY).setDepth(100);
    // テクスチャの外側を埋める4枚の黒い矩形
    this.rects = Array.from({ length: 4 }, () => scene.add.rectangle(0, 0, 1, 1, COLOR.dark).setOrigin(0, 0).setDepth(100));
  }

  update(x: number, y: number): void {
    const half = this.radius; // スケール後のテクスチャ半辺
    this.spot.setPosition(x, y).setScale(this.radius / TEX_R);
    const big = 2 * Math.max(this.world.width, this.world.height);
    const l = x - half, r = x + half, t = y - half, b = y + half;
    const [top, bottom, left, right] = this.rects;
    top.setPosition(x - big, t - big).setSize(2 * big, big);
    bottom.setPosition(x - big, b).setSize(2 * big, big);
    left.setPosition(l - big, t).setSize(big, b - t);
    right.setPosition(r, t).setSize(big, b - t);
  }
}
