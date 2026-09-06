#!/usr/bin/env sh

set -eu

REPOSITORY="${STELLAR_INSTALL_REPOSITORY:-https://github.com/xaoxuu/hexo-theme-stellar-examples.git}"
SOURCE_REF="${STELLAR_INSTALL_REF-main}"

if ! command -v node >/dev/null 2>&1; then
  echo "错误：需要 Node.js 22 或更高版本。" >&2
  exit 1
fi

NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if [ "$NODE_MAJOR" -lt 22 ]; then
  echo "错误：需要 Node.js 22 或更高版本，当前为 $(node --version)。" >&2
  exit 1
fi

if ! command -v git >/dev/null 2>&1; then
  echo "错误：需要 Git 下载 Stellar 创建器。" >&2
  exit 1
fi

TEMP_DIR="$(mktemp -d)"
TEMP_DIR="$(cd "$TEMP_DIR" && pwd -P)"
cleanup() {
  rm -rf "$TEMP_DIR"
}
trap cleanup EXIT HUP INT TERM

git -c http.version=HTTP/1.1 clone --quiet --depth 1 --no-checkout "$REPOSITORY" "$TEMP_DIR/source"
git -C "$TEMP_DIR/source" checkout --quiet --detach "${SOURCE_REF:-HEAD}"
node "$TEMP_DIR/source/scripts/blueprint-artifacts.mjs" build
node "$TEMP_DIR/source/main.mjs" "$@"
