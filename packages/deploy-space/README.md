# `deploy-space`

A github action that will upload a static or gradio space to [Hugging face Spaces](https://huggingface.co/spaces).

```yaml
name: "deploy-space"
on:
  pull_request:

permissions:
  pull-requests: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: gradio-app/github/actions/deploy-space@main
        with:
          hf_token: ${{ secrets.hf_token }}
          gh_token: ${{ secrets.GITHUB_TOKEN }}
          user_name: "pngwn"
          space_name: "space-test-one"
          space_type: "static"
          path: "path"
          comment: true
```

`comment: true` will let the bot comment on your PR. `gh_token` is only required if `comment` is true.
