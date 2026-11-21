#!/usr/bin/env bash
# docs/issues/*.md から GitHub の Issue とラベルを作る。gh CLI でログイン済みであること。
set -euo pipefail
cd "$(dirname "$0")/.."

gh label create approved    --color 0e8a16 --description "人が承認済み。Claude が実装を始める" --force
gh label create needs-human --color d93f0b --description "Claude が判断を求めて停止中" --force
gh label create game        --color 333333 --description "ゲーム本体" --force

titles=(
  "雛形: Phaser + TypeScript + Vite で黒い画面を表示する"
  "目の表示と、慣性のある移動"
  "周囲だけが見える光(視界)"
  "光の粒の収集と出口"
  "影の生き物と体力"
  "木炭風の質感シェーダー"
  "タイトル・結果画面・リスタート"
)
files=(docs/issues/0*.md)

for i in "${!files[@]}"; do
  gh issue create --title "${titles[$i]}" --body-file "${files[$i]}" --label game
done
echo "完了。最初は Issue #1 にだけ approved ラベルを付けてください。"
