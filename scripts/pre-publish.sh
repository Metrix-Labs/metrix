#!/bin/bash
set -e
cd "$(dirname "$0")/.."

version=$VERSION
distTag=${DIST_TAG:-experimental}

if [[ -z "$version" ]]; then
  echo "❌ VERSION not provided"; exit 1
fi

echo "🚀 Publishing prerelease $version (dist-tag: '$distTag')"

# Publish all packages with the moving dist-tag.
# 'yarn release' should publish each changed package with `--tag $distTag`.
yarn release --version "$version" --tag "$distTag" \
  --git-commit false --git-tag false --changelog false
