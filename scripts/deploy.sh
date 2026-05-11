#!/usr/bin/env bash
# Deploy script — pushes the current repo to GitHub.
# Prompts for the GitHub account + PAT every run; never persists credentials.
# Usage:  bash scripts/deploy.sh        (or)  npm run deploy
# Env:    REPO=user/repo BRANCH=main MESSAGE="..." bash scripts/deploy.sh
#
# Why a Personal Access Token (PAT) and not a password?
#   GitHub no longer accepts passwords over HTTPS. Create a fine-scoped PAT at:
#   https://github.com/settings/tokens?type=beta — give it Contents:write on the
#   target repo and an expiry. We feed it via GIT_ASKPASS so the token never
#   appears in your shell history, in `ps`, or in .git/config.

set -euo pipefail

# Defaults — override with env vars or via prompts.
DEFAULT_REPO="vignesh181182/apprecia-admi"
DEFAULT_BRANCH="main"

REPO="${REPO:-$DEFAULT_REPO}"
BRANCH="${BRANCH:-$DEFAULT_BRANCH}"

# ── pretty printing ─────────────────────────────────────────────
bold()    { printf "\033[1m%s\033[0m" "$1"; }
dim()     { printf "\033[2m%s\033[0m" "$1"; }
green()   { printf "\033[32m%s\033[0m" "$1"; }
red()     { printf "\033[31m%s\033[0m" "$1"; }

echo
bold "EngageX deploy"
echo
dim  "Pushing the working tree to GitHub. Credentials are not saved."
echo
echo

# ── 1. choose target repo ───────────────────────────────────────
read -rp "Repo to deploy to ($(dim "owner/name")) [$REPO]: " input_repo
REPO="${input_repo:-$REPO}"

# Strip any leading "https://github.com/" the user might have pasted.
REPO="${REPO#https://github.com/}"
REPO="${REPO%.git}"

read -rp "Branch [$BRANCH]: " input_branch
BRANCH="${input_branch:-$BRANCH}"

REPO_URL="https://github.com/${REPO}.git"

# ── 2. prompt for credentials ───────────────────────────────────
read -rp "GitHub username: " GH_USER
if [[ -z "$GH_USER" ]]; then
  red "Username is required."; echo; exit 1
fi

# -s = silent (no echo). Read into GH_TOKEN, then newline.
read -rsp "Personal Access Token (input hidden): " GH_TOKEN
echo
if [[ -z "$GH_TOKEN" ]]; then
  red "Token is required."; echo; exit 1
fi

# ── 3. commit message ───────────────────────────────────────────
DEFAULT_MSG="${MESSAGE:-chore: deploy $(date +%Y-%m-%d\ %H:%M)}"
read -rp "Commit message [$DEFAULT_MSG]: " input_msg
MSG="${input_msg:-$DEFAULT_MSG}"

# ── 4. set up GIT_ASKPASS to feed creds without exposing them ───
ASKPASS=$(mktemp -t engagex-askpass.XXXXXX)
chmod 600 "$ASKPASS"
trap 'rm -f "$ASKPASS"' EXIT

cat > "$ASKPASS" <<EOF
#!/bin/sh
case "\$1" in
  *Username*) printf '%s' "$GH_USER" ;;
  *Password*) printf '%s' "$GH_TOKEN" ;;
esac
EOF
chmod +x "$ASKPASS"

# ── 5. ensure .git exists, repo configured ──────────────────────
if [[ ! -d .git ]]; then
  echo
  dim "Initializing a fresh git repo..."
  echo
  git init -q
  git checkout -q -b "$BRANCH"
fi

# Make sure .env and other sensitive files aren't accidentally committed.
if ! grep -qE '^\.env$' .gitignore 2>/dev/null; then
  printf '\n.env\n.env.local\n.env.*.local\n' >> .gitignore
fi

# Set or update remote.
if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "$REPO_URL"
else
  git remote add origin "$REPO_URL"
fi

# ── 6. stage + commit ───────────────────────────────────────────
git add -A
if git diff --cached --quiet; then
  dim "No changes to commit — pushing existing HEAD."
  echo
else
  git commit -q -m "$MSG"
fi

# ── 7. push ─────────────────────────────────────────────────────
echo
dim "Pushing to $REPO_URL ($BRANCH)…"
echo

# GIT_TERMINAL_PROMPT=0 prevents git from popping its own credential prompt
# if our askpass somehow doesn't satisfy it.
GIT_ASKPASS="$ASKPASS" GIT_TERMINAL_PROMPT=0 \
  git push -u origin "HEAD:$BRANCH"

echo
green "✓ Deployed to https://github.com/${REPO} (branch: $BRANCH)"
echo
