#!/usr/bin/env bash
# Exercises the widget's shared model (accrual projection, money formatting,
# Codable round trip) on the host, with no simulator involved.
set -euo pipefail
cd "$(dirname "$0")/.."
BIN=$(mktemp -d)/ios-logic-test
swiftc -O scripts/ios-logic-test/main.swift ios/App/Shared/CalmSpendSnapshot.swift -o "$BIN"
"$BIN"
