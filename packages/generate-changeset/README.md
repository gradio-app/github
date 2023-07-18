# `generate-changeset`

A github action that will generate an appropriate changeset for a PR and allow modification of that changeset by modifying the PR title, label and interacting with the generate comment.

```yaml
name: generate-changeset
on:
  pull_request:
    types: [opened, synchronize, reopened, edited, labeled, unlabeled, closed]
    branches:
      - main
  issue_comment:
    types: [edited]

concurrency:
  group: ${{ github.event.number || github.event.issue.number }}

jobs:
  generate-changeset:
    permissions: write-all
    name: static checks
    runs-on: ubuntu-22.04
    steps:
      - id: "get-branch"
        run: echo ::set-output name=branch::$(gh pr view $PR_NO --repo $REPO --json headRefName --jq '.headRefName')
        env:
          REPO: ${{ github.repository }}
          PR_NO: ${{ github.event.number || github.event.issue.number }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      - uses: actions/checkout@v3
        with:
          ref: ${{ steps.get-branch.outputs.branch }}
          fetch-depth: 0
      - name: generate changeset
        uses: "./.github/actions/generate-changeset"
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          main_pkg: gradio
```

`main_pkg` allows you to set a default main package, for which changelog entries will _also_ be generated if the package(s) with changes include `"main_changeset": true` in their `package.json`.
