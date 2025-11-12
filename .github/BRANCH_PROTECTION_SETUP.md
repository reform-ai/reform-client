# Branch Protection Rule Setup Guide

This guide explains how to set up a branch protection rule requiring at least one reviewer approval before merging PRs.

## Option 1: Using GitHub Web UI

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Branches**
3. Click **Add rule** or **Edit** if a rule already exists for `main`
4. Under **Branch name pattern**, enter: `main` (or `*` for all branches)
5. Enable the following settings:
   - ✅ **Require a pull request before merging**
     - ✅ **Require approvals**: Set to `1`
     - ✅ **Dismiss stale pull request approvals when new commits are pushed** (optional but recommended)
   - ✅ **Require status checks to pass before merging** (optional, if you have CI/CD)
   - ✅ **Require conversation resolution before merging** (optional but recommended)
6. Click **Create** or **Save changes**

## Option 2: Using GitHub CLI

If you have GitHub CLI installed and authenticated:

```bash
gh api repos/:owner/:repo/branches/main/protection \
  --method PUT \
  --field required_status_checks=null \
  --field enforce_admins=false \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  --field restrictions=null
```

Replace `:owner` and `:repo` with your GitHub username/org and repository name.

## Option 3: Using GitHub API

You can also use the GitHub REST API directly with a personal access token:

```bash
curl -X PUT \
  -H "Authorization: token YOUR_GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/OWNER/REPO/branches/main/protection \
  -d '{
    "required_pull_request_reviews": {
      "required_approving_review_count": 1,
      "dismiss_stale_reviews": true
    },
    "enforce_admins": false,
    "required_status_checks": null,
    "restrictions": null
  }'
```

## Verification

After setting up the rule:
1. Create a test PR
2. Try to merge without an approval - it should be blocked
3. Have someone approve the PR
4. Now merging should be allowed

---

**Note:** You need admin/owner permissions on the repository to set up branch protection rules.

