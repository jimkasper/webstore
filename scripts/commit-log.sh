#!/usr/bin/env bash
# Writes COMMIT_LOG.txt: every commit message (newest first, merges excluded, max 200).
# Read by the jimkasper.net Deploy panel and shown on the Apps page. No dependencies beyond git.
#
# Entry format (entries are separated by a line containing only "----"):
#   <hash7> | <YYYY-MM-DD> | <files> files, <lines> lines[ | notable]
#   <subject>
#   <body, optional>
# "notable" = has a message body AND touched >= 10 files or >= 300 lines (used for "greatest hits").
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
OUT="${1:-COMMIT_LOG.txt}"
MAX="${COMMIT_LOG_MAX:-200}"
TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT

first=1
while read -r h; do
  [ -z "$h" ] && continue
  subject="$(git log -1 --format=%s "$h")"
  case "$subject" in "Update commit log"*) continue ;; esac
  date="$(git log -1 --format=%ad --date=short "$h")"
  body="$(git log -1 --format=%b "$h" | sed -e :a -e '/^\n*$/{$d;N;ba' -e '}' | grep -v -e '^Co-Authored-By:' -e '^Claude-Session:' || true)"
  stat="$(git show --shortstat --format= "$h" | tail -n 1)"
  files="$(sed -n 's/^ *\([0-9]*\) file.*/\1/p' <<<"$stat")"; files="${files:-0}"
  ins="$(sed -n 's/.* \([0-9]*\) insertion.*/\1/p' <<<"$stat")"; ins="${ins:-0}"
  del="$(sed -n 's/.* \([0-9]*\) deletion.*/\1/p' <<<"$stat")"; del="${del:-0}"
  lines=$((ins + del))
  flag=""
  if [ -n "${body//[[:space:]]/}" ] && { [ "$files" -ge 10 ] || [ "$lines" -ge 300 ]; }; then flag=" | notable"; fi
  [ $first -eq 0 ] && echo "----" >>"$TMP"
  first=0
  { echo "$(git rev-parse --short=7 "$h") | $date | $files files, $lines lines$flag"; echo "$subject"; [ -n "$body" ] && echo "$body"; } >>"$TMP"
done < <(git rev-list --no-merges -n $((MAX + 20)) HEAD | head -n $((MAX + 20)))

# Cap at MAX entries.
awk -v max="$MAX" 'BEGIN{n=1} /^----$/{n++; if(n>max) exit} {print}' "$TMP" >"$TMP.cap" && mv "$TMP.cap" "$TMP"

if [ ! -f "$OUT" ] || ! cmp -s "$TMP" "$OUT"; then cp "$TMP" "$OUT"; echo "Wrote $OUT"; else echo "$OUT unchanged"; fi
