# @metricinsights/qa-ai-rules

Shared QA/testing rules for AI coding tools, distributed as an npm package. Install once, get consistent test-case rules across all your repositories.

Currently supports **Cursor IDE** and **Claude Code**.

## Installation

```bash
npx @metricinsights/qa-ai-rules
```

This runs the interactive setup and adds the package to your `devDependencies` automatically.

## Setup

The `init` command walks you through tool selection, updates `.gitignore`, and installs rule files:

```bash
npx qa-ai-rules          # interactive setup (default)
npx qa-ai-rules init     # same as above
```

Or skip prompts with flags:

```bash
npx qa-ai-rules init --cursor
npx qa-ai-rules init --cursor --claude
```

This creates `qa-ai-rules.config.json` at your repo root — commit this file:

```json
{
  "tools": {
    "cursor": true,
    "claude": false
  }
}
```

## CLI commands

| Command                   | Description                                                 |
| ------------------------- | ----------------------------------------------------------- |
| `npx qa-ai-rules`         | Interactive setup (default)                                 |
| `npx qa-ai-rules init`    | Select tools, update `.gitignore`, install rule files       |
| `npx qa-ai-rules install` | Silent reinstall from existing config (used by postinstall) |
| `npx qa-ai-rules status`  | Show config, installed files, and `.gitignore` health       |

## Where files are installed

| Tool        | Destination                        |
| ----------- | ---------------------------------- |
| Cursor IDE  | `.cursor/rules/qa-ai-rules--*.mdc` |
| Claude Code | `.claude/rules/qa-ai-rules/*.md`   |

Generated files are **gitignored** automatically. Only `qa-ai-rules.config.json` is committed.

> **Note:** Cursor does not load `.mdc` files from subdirectories of `.cursor/rules/`, so rules are installed flat with a `qa-ai-rules--` filename prefix. Claude Code supports subdirectories natively.

## Included rules

| File                  | Description                                                        |
| --------------------- | ------------------------------------------------------------------ |
| `test-case-rules`     | Structure, formatting, and content rules for generating test cases |
| `test-suite-template` | Starter template for a page-level test suite                       |

## Updating

`postinstall` automatically reinstalls rule files whenever you run `npm install`. To pick up new rules after a version bump, just update the package:

```bash
npm update @metricinsights/qa-ai-rules
```

Use Dependabot to auto-update minor and patch bumps.

## Publishing

Releases use the shared workflows from [mi-examples-workflows](https://github.com/mi-examples/mi-examples-workflows) ([release flow](https://github.com/mi-examples/mi-examples-workflows/blob/main/docs/workflows.md#release-workflows)). The caller is [`.github/workflows/release.yml`](.github/workflows/release.yml).

- **Betas.** Every push to `develop` with releasable commits publishes `X.Y.Z-beta.N` to npm under the `beta` dist-tag, with a GitHub prerelease. Install one with `npm install @metricinsights/qa-ai-rules@beta`.
- **Production releases.**
  1. Run **Actions → Release → Run workflow**. It opens a release pull request `release/vX.Y.Z → main` with the version bump and the new `CHANGELOG.md` entry.
  2. Review and edit the entry in the pull request, then merge it.
  3. Merging publishes to npm under `latest` and creates the tag and the GitHub release. It also opens the back-merge pull request into `develop`.
- **Versions** come from [Conventional Commits](https://www.conventionalcommits.org/):
  - `feat` → minor;
  - `fix`, `perf` and `revert` → patch;
  - `!` or a `BREAKING CHANGE:` footer → major;
  - other types don't release.
- **Publishing** uses npm Trusted Publishing (OIDC) from `release.yml` in the `npm-publish` environment. No npm token is needed or stored.
  - Don't rename `release.yml`: the trusted publisher is registered for that filename.
  - Setup and troubleshooting are in [npm-publishing.md](https://github.com/mi-examples/mi-examples-workflows/blob/main/docs/npm-publishing.md).

## License

MIT
