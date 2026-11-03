#!/usr/bin/env bash
# Optional: regenerate COMMIT_LOG.txt after every local commit.
set -e
cd "$(git rev-parse --show-toplevel)"
printf '#!/usr/bin/env bash\nbash scripts/commit-log.sh >/dev/null 2>&1 || true\n' > .git/hooks/post-commit
chmod +x .git/hooks/post-commit
echo "Installed post-commit hook."
