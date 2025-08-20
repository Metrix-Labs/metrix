#!/bin/bash
set -e

# Always start from repo root
cd "$(dirname "$0")/.."

version=$VERSION
distTag=$DIST_TAG

if [[ -z "$version" ]]; then
  echo "❌ VERSION not provided"
  exit 1
fi

if [[ -z "$distTag" ]]; then
  distTag="latest"
fi

echo "🚀 Publishing Metrix version bump: $version (dist-tag: $distTag)"

# Run release (assuming changesets or lerna behind `yarn release`)
yarn release --version "$version" --tag "$distTag" --git-commit false --git-tag false --changelog false
