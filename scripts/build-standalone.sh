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
