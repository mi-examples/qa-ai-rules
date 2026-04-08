# @metricinsights/qa-ai-rules

Shared QA rules package for AI coding tools across all MI repositories.
Published to GitHub Packages (`https://npm.pkg.github.com`).

## Purpose

Distributes QA/testing rule files to consuming repos via `npm install`.
Currently supports Cursor IDE and Claude Code. Designed to be extended with
new tools in the future.

## Package structure

```
scripts/
  cli.js          ← CLI entry point (bin: qa-ai-rules)
src/
  cursor/
    test-case-rules.mdc
    test-suite-template.mdc
  claude/
    test-case-rules.md
    test-suite-template.md
package.json
CLAUDE.md
```

## Key dependencies

- `cac` — CLI framework (commands, flags, auto --help)
- `@clack/prompts` — interactive prompts (multiselect, confirm, spinner, intro/outro)
- `picocolors` — terminal colours (zero deps, lightweight)

## CLI commands

```bash
npx qa-ai-rules          # default: runs init (interactive)
npx qa-ai-rules init     # interactive setup: select tools, .gitignore, install
npx qa-ai-rules install  # silent reinstall from existing config (used by postinstall)
npx qa-ai-rules status   # show config, installed files, .gitignore health
```

### init flags (skip prompts)

```bash
npx qa-ai-rules init --cursor
npx qa-ai-rules init --cursor --claude
```

## How postinstall works

`postinstall` in package.json calls `node scripts/cli.js install` (not `init`).
This is intentionally non-interactive — safe for CI and `npm install` runs.
If no `qa-ai-rules.config.json` is found, it prints a hint and exits cleanly.

## Config file (lives in each consuming repo, committed to git)

```json
// qa-ai-rules.config.json — at repo root
{
  "tools": {
    "cursor": true,
    "claude": false
  }
}
```

## Where rule files are installed in consuming repos

| Tool        | Destination                        | Pattern                                         |
| ----------- | ---------------------------------- | ----------------------------------------------- |
| Cursor IDE  | `.cursor/rules/qa-ai-rules--*.mdc` | Flat + prefixed (Cursor limitation: no subdirs) |
| Claude Code | `.claude/rules/qa-ai-rules/*.md`   | Subdirectory (natively supported)               |

## .gitignore rules added to consuming repos

```
.cursor/rules/qa-ai-rules--*
.claude/rules/qa-ai-rules/
```

Generated files are gitignored in consuming repos. Only `qa-ai-rules.config.json`
is committed. Dev-owned rules are never touched.

## Important: Cursor subdirectory limitation

Cursor does NOT load `.mdc` files from subdirectories of `.cursor/rules/`.
Rules must be flat at `.cursor/rules/*.mdc`. That is why we use a filename
prefix (`qa-ai-rules--`) instead of a subfolder. Claude Code supports
subdirectories natively, so it uses `.claude/rules/qa-ai-rules/`.

## Adding a new AI tool

1. Add source files to `src/<toolname>/`
2. Add an entry to the `TOOLS` object in `scripts/cli.js`:
   ```js
   newtool: {
     label:       'New Tool',
     hint:        'destination path description',
     dest:        '.newtool/rules',
     filePrefix:  'qa-ai-rules--',   // or '' if subdirs are supported
     ignoreRules: ['.newtool/rules/qa-ai-rules--*'],
     srcDir:      'newtool',
   }
   ```
3. Add `--newtool` flag option in the `init` command in `cli.js`
4. Bump minor version and publish

## Versioning

| Change                      | Bump    |
| --------------------------- | ------- |
| New rule content / new tool | `minor` |
| Breaking rule restructure   | `major` |
| Typo / formatting fix       | `patch` |

Consuming repos should use Dependabot to auto-update minor/patch bumps.

## Publishing

```bash
npm version minor
npm publish
```
