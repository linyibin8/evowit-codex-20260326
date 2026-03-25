#!/bin/bash
set -euo pipefail

cd "${1:-$HOME/evowit}"

if ! command -v brew >/dev/null 2>&1; then
  echo "Homebrew is required."
  exit 1
fi

brew list xcodegen >/dev/null 2>&1 || brew install xcodegen
brew list fastlane >/dev/null 2>&1 || brew install fastlane

cd ios
xcodegen generate
bundle exec fastlane beta || fastlane beta
