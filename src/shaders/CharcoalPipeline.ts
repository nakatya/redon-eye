import Phaser from 'phaser';

/** 木炭風の質感の強さ。0 で無効。初期値は控えめ。 */
export interface CharcoalParams {
  /** 紙の粒子ノイズ */
  grain: number;
  /** 周辺減光 */
  vignette: number;
  /** にじみ(ぼかし混合) */
  smudge: number;
  /** グレー階調への変換と低コントラスト化 */
  tone: number;
}

export const DEFAULT_CHARCOAL: CharcoalParams = { grain: 0.06, vignette: 0.35, smudge: 0.25, tone: 0.8 };

const FRAG = `
precision mediump float;
uniform sampler2D uMainSampler;
uniform float uTime;
uniform vec2 uRes;
uniform float uGrain;
uniform float uVignette;
uniform float uSmudge;
uniform float uTone;
varying vec2 outTexCoord;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec2 uv = outTexCoord;
  vec2 px = 1.0 / uRes;
  vec4 c = texture2D(uMainSampler, uv);
  // わずかなにじみ: 近傍の平均と混ぜる
  vec4 b = (texture2D(uMainSampler, uv + vec2(px.x * 1.5, 0.0))
          + texture2D(uMainSampler, uv - vec2(px.x * 1.5, 0.0))
          + texture2D(uMainSampler, uv + vec2(0.0, px.y * 1.5))
          + texture2D(uMainSampler, uv - vec2(0.0, px.y * 1.5))) * 0.25;
  vec3 rgb = mix(c.rgb, b.rgb, uSmudge);
  // グレー階調 + 低コントラスト(黒 #0b0b0b 〜 紙色 #d8d2c4)
  float g = dot(rgb, vec3(0.299, 0.587, 0.114));
  vec3 ink = mix(vec3(0.043), vec3(0.847, 0.824, 0.769), g);
  rgb = mix(rgb, ink, uTone);
  // 紙の粒子ノイズ(時間で少し揺らぐ)
  float t = floor(uTime * 8.0);
  float n = hash(floor(uv * uRes) + t) - 0.5;
  rgb += n * uGrain;
  // 周辺減光
  float d = distance(uv, vec2(0.5));
  rgb *= 1.0 - uVignette * smoothstep(0.3, 0.75, d);
  gl_FragColor = vec4(clamp(rgb, 0.0, 1.0), c.a);
}
`;

export class CharcoalPipeline extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
  static readonly KEY = 'Charcoal';
  params: CharcoalParams = { ...DEFAULT_CHARCOAL };
  private elapsed = 0;

  constructor(game: Phaser.Game) {
    super({ game, name: CharcoalPipeline.KEY, fragShader: FRAG });
  }

  onPreRender(): void {
    this.elapsed = this.game.loop.time / 1000;
  }

  onDraw(target: Phaser.Renderer.WebGL.RenderTarget): void {
    this.set1f('uTime', this.elapsed);
    this.set2f('uRes', this.renderer.width, this.renderer.height);
    this.set1f('uGrain', this.params.grain);
    this.set1f('uVignette', this.params.vignette);
    this.set1f('uSmudge', this.params.smudge);
    this.set1f('uTone', this.params.tone);
    this.bindAndDraw(target);
  }
}

/** WebGL のときだけ適用する。Canvas の場合は何もしない。 */
export function applyCharcoal(scene: Phaser.Scene, params: Partial<CharcoalParams> = {}): void {
  const renderer = scene.game.renderer;
  if (!(renderer instanceof Phaser.Renderer.WebGL.WebGLRenderer)) return;
  if (!renderer.pipelines.getPostPipeline(CharcoalPipeline.KEY)) {
    renderer.pipelines.addPostPipeline(CharcoalPipeline.KEY, CharcoalPipeline);
  }
  scene.cameras.main.setPostPipeline(CharcoalPipeline.KEY);
  const p = scene.cameras.main.getPostPipeline(CharcoalPipeline.KEY);
  const pipe = (Array.isArray(p) ? p[0] : p) as CharcoalPipeline | undefined;
  if (pipe) Object.assign(pipe.params, params);
}
