#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $(basename "$0") \"commit message\""
  exit 2
fi

MSG="$1"

GIT_AUTHOR_NAME="naverassb" \
GIT_AUTHOR_EMAIL="269252241+naverassb@users.noreply.github.com" \
GIT_COMMITTER_NAME="naverassb" \
GIT_COMMITTER_EMAIL="269252241+naverassb@users.noreply.github.com" \
git commit -m "$MSG"

