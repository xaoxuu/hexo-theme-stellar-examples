#!/usr/bin/env sh

set -eu

REPOSITORY="xaoxuu/hexo-theme-stellar-examples"
INSTALL_VERSION="${STELLAR_INSTALL_VERSION:-latest}"

if ! command -v node >/dev/null 2>&1; then
  echo "错误：需要 Node.js 22 或更高版本。" >&2
  exit 1
fi

NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if [ "$NODE_MAJOR" -lt 22 ]; then
  echo "错误：需要 Node.js 22 或更高版本，当前为 $(node --version)。" >&2
  exit 1
fi

if ! command -v curl >/dev/null 2>&1; then
  echo "错误：需要 curl 下载 Stellar 创建器。" >&2
  exit 1
fi

if [ -n "${STELLAR_INSTALL_BASE_URL:-}" ]; then
  BASE_URL="${STELLAR_INSTALL_BASE_URL%/}"
elif [ "$INSTALL_VERSION" = "latest" ]; then
  BASE_URL="https://github.com/$REPOSITORY/releases/latest/download"
else
  case "$INSTALL_VERSION" in
    v*) RELEASE_TAG="$INSTALL_VERSION" ;;
    *) RELEASE_TAG="v$INSTALL_VERSION" ;;
  esac
  BASE_URL="https://github.com/$REPOSITORY/releases/download/$RELEASE_TAG"
fi

TEMP_DIR="$(mktemp -d)"
cleanup() {
  rm -rf "$TEMP_DIR"
}
trap cleanup EXIT HUP INT TERM

curl -fsSL "$BASE_URL/main.mjs" -o "$TEMP_DIR/main.mjs"
curl -fsSL "$BASE_URL/checksums.txt" -o "$TEMP_DIR/checksums.txt"

EXPECTED="$(awk '$2 == "main.mjs" { print $1 }' "$TEMP_DIR/checksums.txt")"
if [ -z "$EXPECTED" ]; then
  echo "错误：版本校验文件缺少 main.mjs。" >&2
  exit 1
fi

if command -v shasum >/dev/null 2>&1; then
  ACTUAL="$(shasum -a 256 "$TEMP_DIR/main.mjs" | awk '{ print $1 }')"
elif command -v sha256sum >/dev/null 2>&1; then
  ACTUAL="$(sha256sum "$TEMP_DIR/main.mjs" | awk '{ print $1 }')"
else
  echo "错误：需要 shasum 或 sha256sum 校验创建器。" >&2
  exit 1
fi

if [ "$EXPECTED" != "$ACTUAL" ]; then
  echo "错误：main.mjs SHA-256 校验失败。" >&2
  exit 1
fi

node "$TEMP_DIR/main.mjs" "$@"
