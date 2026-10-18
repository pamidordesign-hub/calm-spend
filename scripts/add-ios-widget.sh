#!/usr/bin/env bash
# Runs add-ios-widget.rb with the xcodeproj gem that ships inside Homebrew's
# CocoaPods, so nothing extra has to be installed system-wide.
set -euo pipefail

GEMS=$(ls -d /opt/homebrew/Cellar/cocoapods/*/libexec/gems 2>/dev/null | tail -1)
if [[ -z "${GEMS:-}" ]]; then
  echo "CocoaPods (and its xcodeproj gem) not found. Install with: brew install cocoapods" >&2
  exit 1
fi

RUBY_BIN=/opt/homebrew/opt/ruby/bin/ruby
[[ -x "$RUBY_BIN" ]] || RUBY_BIN=$(command -v ruby)

LOAD_PATH=$(ls -d "$GEMS"/*/lib | tr '\n' ':')
SCRIPT="$(cd "$(dirname "$0")" && pwd)/add-ios-widget.rb"

CS_LOAD_PATH="$LOAD_PATH" CS_SCRIPT="$SCRIPT" "$RUBY_BIN" -e '
  $LOAD_PATH.unshift(*ENV["CS_LOAD_PATH"].split(":").reject(&:empty?))
  load ENV["CS_SCRIPT"]
'
