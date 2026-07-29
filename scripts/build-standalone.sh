#!/usr/bin/env bash

set -euo pipefail

npm run build

rm -rf \
  .next/standalone/public \
  .next/standalone/.next/static

mkdir -p \
  .next/standalone/.next

cp -a \
  public \
  .next/standalone/public

cp -a \
  .next/static \
  .next/standalone/.next/static

echo "standaloneへの静的ファイルコピーが完了しました。"

test -f \
  .next/standalone/public/images/top/main-01.jpg

test -f \
  .next/standalone/public/images/top/main-02.jpg

test -f \
  .next/standalone/public/images/top/main-03.jpg

echo "TOP画像3枚を確認しました。"
