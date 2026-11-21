import Phaser from 'phaser';
import { COLOR, shade } from '../palette';

const KEY = 'ground-paper';
const SIZE = 512;
const N = 16; // むらの格子数(継ぎ目なくタイルする)

/** 照らされた紙の地面。紙の粒子と木炭のむらを持つ静的テクスチャをタイルして敷く。 */
export function createGround(scene: Phaser.Scene, world: { width: number; height: number }): Phaser.GameObjects.TileSprite {
  if (!scene.textures.exists(KEY)) {
    const tex = scene.textures.createCanvas(KEY, SIZE, SIZE)!;
    const ctx = tex.getContext();
    const img = ctx.createImageData(SIZE, SIZE);
    const rnd = new Phaser.Math.RandomDataGenerator(['ground']);
    const cells = Array.from({ length: N * N }, () => rnd.frac());
    const cell = (x: number, y: number): number => cells[(y % N) * N + (x % N)];
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        const fx = (x / SIZE) * N, fy = (y / SIZE) * N;
        const x0 = Math.floor(fx), y0 = Math.floor(fy);
        const tx = fx - x0, ty = fy - y0;
        const smudge =
          (cell(x0, y0) * (1 - tx) + cell(x0 + 1, y0) * tx) * (1 - ty) +
          (cell(x0, y0 + 1) * (1 - tx) + cell(x0 + 1, y0 + 1) * tx) * ty;
        const v = 0.5 + (smudge - 0.5) * 0.7 + (rnd.frac() - 0.5) * 0.5;
        const [r, g, b] = shade(COLOR.ground, v, 0.22);
        const i = (y * SIZE + x) * 4;
        img.data[i] = r;
        img.data[i + 1] = g;
        img.data[i + 2] = b;
        img.data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    tex.refresh();
  }
  return scene.add.tileSprite(0, 0, world.width, world.height, KEY).setOrigin(0, 0).setDepth(-10);
}
