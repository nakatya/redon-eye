## 目的
Phaser 3 + TypeScript + Vite のプロジェクト雛形を作り、真っ暗な画面が表示される状態にする。

## やること
- `package.json` に `dev` / `build` / `typecheck` / `test` スクリプトを用意(CLAUDE.md のコマンドと一致させる)
- TypeScript は strict
- Vitest を導入し、ダミーのテストを1本置く
- `src/main.ts` で Phaser を起動し、背景色 #0b0b0b の `GameScene` を表示
- `vite.config.ts` の `base` を GitHub Pages のリポジトリ名に合わせる(`./` でも可)
- `.gitignore`(node_modules, dist)

## 受け入れ条件
- [ ] `npm ci && npm run typecheck && npm test && npm run build` が通る
- [ ] `npm run dev` でブラウザに 960×540 の黒い画面が出る(ウィンドウに合わせて拡大縮小)
