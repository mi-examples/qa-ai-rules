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

## License

MIT
