#!/bin/bash
# Test script for TrustNet governance automation
set -euo pipefail

dry_run=false
if [[ "${1:-}" == "--dry-run" ]]; then dry_run=true; fi

branch="test-rotation-$(date +%Y%m%d-%H%M%S)"

echo "==> Creating test change to trigger governance workflow"
echo "- Test rotation validation at $(date)" >> governance/observer-notebook/2025-08-21-initial.md

if $dry_run; then
  echo "==> Dry run: showing diff only"
  git --no-pager diff | cat
  echo "==> To run live: ./test-rotation.sh"
  exit 0
fi

echo "==> Creating branch: $branch"
git checkout -b "$branch"

echo "==> Committing test change"
git add governance/observer-notebook/2025-08-21-initial.md
git commit -m "chore: test governance automation on $branch"

echo "==> Pushing branch and setting upstream"
git push -u origin "$branch"

echo "✅ Test branch '$branch' pushed. Open a PR to main and check Actions tab for results."

