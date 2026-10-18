#!/usr/bin/env bash
# Renders the widget layouts to a PNG using the shipped view code.
set -euo pipefail
cd "$(dirname "$0")/.."
OUT="${1:-widget-preview.png}"
BIN=$(mktemp -d)/preview
# -swift-version 5: this is a throwaway render harness, not shipped code,
# and ImageRenderer's MainActor isolation is not worth ceremony here.
swiftc -O -swift-version 5 \
  scripts/preview-widget/main.swift \
  ios/App/Shared/CalmSpendSnapshot.swift \
  ios/App/CalmSpendWidget/CalmSpendWidgetView.swift \
  -o "$BIN"
"$BIN" "$OUT"
