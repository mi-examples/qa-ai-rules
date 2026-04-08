/**
 * E2E tests for qa-ai-rules installation scenarios.
 *
 * Prerequisites (handled by CI before `npm test`):
 *   - `npm run build` must have run → dist/cli.js exists
 *   - `npm run build` postbuild → metricinsights-qa-ai-rules-latest.tgz exists
 *
 * Two high-level scenarios:
 *   1. npx-like:  run `node dist/cli.js init --<tool>` in a temp repo
 *   2. npm install: install the -latest.tgz in a temp repo, triggering postinstall
 */

import { test, expect } from '@playwright/test';
import { spawnSync, SpawnSyncReturns } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

// ─── Paths ────────────────────────────────────────────────────────────────────

const REPO_ROOT = path.resolve(__dirname, '..');
const CLI_PATH = path.join(REPO_ROOT, 'dist', 'cli.js');
const TGZ_PATH = path.join(REPO_ROOT, 'metricinsights-qa-ai-rules-latest.tgz');

// Source files — what we expect to find after installation
const CURSOR_SRC = path.join(REPO_ROOT, 'rules', 'cursor');
const CLAUDE_SRC = path.join(REPO_ROOT, 'rules', 'claude');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Create an isolated temp directory for a single test.
 * The caller is responsible for cleanup (afterEach).
 */
function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'qa-ai-rules-test-'));
}

/**
 * Pre-populate .gitignore with both ignore rules so that `init --<tool>`
 * does not pause for an interactive confirm prompt.
 */
function writeGitignore(dir: string): void {
  fs.writeFileSync(
    path.join(dir, '.gitignore'),
    '.cursor/rules/qa-ai-rules--*\n.claude/rules/qa-ai-rules/\n',
  );
}

/** Run the CLI via `node dist/cli.js <args>` in the given cwd. */
function runCli(
  args: string[],
  cwd: string,
): SpawnSyncReturns<string> {
  return spawnSync('node', [CLI_PATH, ...args], {
    cwd,
    encoding: 'utf8',
    // Disable color so stdout is plain text for assertions
    env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' },
  });
}

/**
 * Run an npm command in the given cwd.
 * shell:true is required on Windows where `npm` is `npm.cmd` and cannot
 * be resolved without going through the system shell.
 */
function runNpm(
  args: string[],
  cwd: string,
): SpawnSyncReturns<string> {
  return spawnSync('npm', args, {
    cwd,
    encoding: 'utf8',
    shell: true,
    env: { ...process.env },
  });
}

// Destination paths relative to the consuming repo root
const CURSOR_DEST = path.join('.cursor', 'rules');
const CLAUDE_DEST = path.join('.claude', 'rules', 'qa-ai-rules');

// ─── Group 1: init with flags (npx scenario) ─────────────────────────────────

test.describe('init with flags — npx scenario', () => {
  let dir: string;

  test.beforeEach(() => {
    dir = makeTempDir();
    // Pre-populate .gitignore with all possible rules to avoid interactive prompts.
    // No package.json → ensureSavedDependency() returns early (no prompt).
    writeGitignore(dir);
  });

  test.afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  // ── cursor only ────────────────────────────────────────────────────────────

  test('init --cursor: exits 0', () => {
    const result = runCli(['init', '--cursor'], dir);
    expect(result.status).toBe(0);
  });

  test('init --cursor: writes config with cursor=true, claude=false', () => {
    runCli(['init', '--cursor'], dir);
    const config = JSON.parse(
      fs.readFileSync(path.join(dir, 'qa-ai-rules.config.json'), 'utf8'),
    );
    expect(config.tools).toEqual({ cursor: true, claude: false });
  });

  test('init --cursor: installs all cursor rule files', () => {
    runCli(['init', '--cursor'], dir);
    const srcFiles = fs.readdirSync(CURSOR_SRC);
    for (const file of srcFiles) {
      const dest = path.join(dir, CURSOR_DEST, `qa-ai-rules--${file}`);
      expect(fs.existsSync(dest), `expected ${dest} to exist`).toBe(true);
    }
  });

  test('init --cursor: cursor file content matches source', () => {
    runCli(['init', '--cursor'], dir);
    const srcFiles = fs.readdirSync(CURSOR_SRC);
    for (const file of srcFiles) {
      const installed = fs.readFileSync(
        path.join(dir, CURSOR_DEST, `qa-ai-rules--${file}`),
        'utf8',
      );
      const source = fs.readFileSync(path.join(CURSOR_SRC, file), 'utf8');
      expect(installed).toBe(source);
    }
  });

  test('init --cursor: does not create claude directory', () => {
    runCli(['init', '--cursor'], dir);
    expect(fs.existsSync(path.join(dir, '.claude', 'rules', 'qa-ai-rules'))).toBe(false);
  });

  // ── claude only ────────────────────────────────────────────────────────────

  test('init --claude: exits 0', () => {
    const result = runCli(['init', '--claude'], dir);
    expect(result.status).toBe(0);
  });

  test('init --claude: writes config with cursor=false, claude=true', () => {
    runCli(['init', '--claude'], dir);
    const config = JSON.parse(
      fs.readFileSync(path.join(dir, 'qa-ai-rules.config.json'), 'utf8'),
    );
    expect(config.tools).toEqual({ cursor: false, claude: true });
  });

  test('init --claude: installs all claude rule files', () => {
    runCli(['init', '--claude'], dir);
    const srcFiles = fs.readdirSync(CLAUDE_SRC);
    for (const file of srcFiles) {
      const dest = path.join(dir, CLAUDE_DEST, file);
      expect(fs.existsSync(dest), `expected ${dest} to exist`).toBe(true);
    }
  });

  test('init --claude: claude file content matches source', () => {
    runCli(['init', '--claude'], dir);
    const srcFiles = fs.readdirSync(CLAUDE_SRC);
    for (const file of srcFiles) {
      const installed = fs.readFileSync(
        path.join(dir, CLAUDE_DEST, file),
        'utf8',
      );
      const source = fs.readFileSync(path.join(CLAUDE_SRC, file), 'utf8');
      expect(installed).toBe(source);
    }
  });

  test('init --claude: does not create cursor directory', () => {
    runCli(['init', '--claude'], dir);
    expect(fs.existsSync(path.join(dir, '.cursor', 'rules'))).toBe(false);
  });

  // ── both tools ─────────────────────────────────────────────────────────────

  test('init --cursor --claude: exits 0', () => {
    const result = runCli(['init', '--cursor', '--claude'], dir);
    expect(result.status).toBe(0);
  });

  test('init --cursor --claude: writes config with both enabled', () => {
    runCli(['init', '--cursor', '--claude'], dir);
    const config = JSON.parse(
      fs.readFileSync(path.join(dir, 'qa-ai-rules.config.json'), 'utf8'),
    );
    expect(config.tools).toEqual({ cursor: true, claude: true });
  });

  test('init --cursor --claude: installs cursor and claude files', () => {
    runCli(['init', '--cursor', '--claude'], dir);

    const cursorFiles = fs.readdirSync(CURSOR_SRC);
    for (const file of cursorFiles) {
      expect(
        fs.existsSync(path.join(dir, CURSOR_DEST, `qa-ai-rules--${file}`)),
      ).toBe(true);
    }

    const claudeFiles = fs.readdirSync(CLAUDE_SRC);
    for (const file of claudeFiles) {
      expect(fs.existsSync(path.join(dir, CLAUDE_DEST, file))).toBe(true);
    }
  });

  // ── re-run idempotency ─────────────────────────────────────────────────────

  test('init --cursor twice: files are re-installed (idempotent)', () => {
    runCli(['init', '--cursor'], dir);
    // Corrupt a file to prove it gets overwritten on second run
    const target = path.join(dir, CURSOR_DEST, 'qa-ai-rules--test-case-rules.mdc');
    fs.writeFileSync(target, 'corrupted');

    runCli(['init', '--cursor'], dir);

    const restored = fs.readFileSync(target, 'utf8');
    const source = fs.readFileSync(
      path.join(CURSOR_SRC, 'test-case-rules.mdc'),
      'utf8',
    );
    expect(restored).toBe(source);
  });
});

// ─── Group 2: install command (postinstall hook scenario) ─────────────────────

test.describe('install command — postinstall hook scenario', () => {
  let dir: string;

  test.beforeEach(() => {
    dir = makeTempDir();
  });

  test.afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  test('install with no config: exits 0 and prints hint', () => {
    const result = runCli(['install'], dir);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('No qa-ai-rules.config.json found');
  });

  test('install with no config: creates no rule files', () => {
    runCli(['install'], dir);
    expect(fs.existsSync(path.join(dir, '.cursor'))).toBe(false);
    expect(fs.existsSync(path.join(dir, '.claude'))).toBe(false);
  });

  test('install with cursor config: reinstalls cursor files', () => {
    fs.writeFileSync(
      path.join(dir, 'qa-ai-rules.config.json'),
      JSON.stringify({ tools: { cursor: true, claude: false } }, null, 2),
    );
    const result = runCli(['install'], dir);
    expect(result.status).toBe(0);

    const srcFiles = fs.readdirSync(CURSOR_SRC);
    for (const file of srcFiles) {
      expect(
        fs.existsSync(path.join(dir, CURSOR_DEST, `qa-ai-rules--${file}`)),
      ).toBe(true);
    }
  });

  test('install with claude config: reinstalls claude files', () => {
    fs.writeFileSync(
      path.join(dir, 'qa-ai-rules.config.json'),
      JSON.stringify({ tools: { cursor: false, claude: true } }, null, 2),
    );
    const result = runCli(['install'], dir);
    expect(result.status).toBe(0);

    const srcFiles = fs.readdirSync(CLAUDE_SRC);
    for (const file of srcFiles) {
      expect(fs.existsSync(path.join(dir, CLAUDE_DEST, file))).toBe(true);
    }
  });

  test('install with both tools config: reinstalls all files', () => {
    fs.writeFileSync(
      path.join(dir, 'qa-ai-rules.config.json'),
      JSON.stringify({ tools: { cursor: true, claude: true } }, null, 2),
    );
    runCli(['install'], dir);

    expect(
      fs.existsSync(path.join(dir, CURSOR_DEST, 'qa-ai-rules--test-case-rules.mdc')),
    ).toBe(true);
    expect(
      fs.existsSync(path.join(dir, CLAUDE_DEST, 'test-case-rules.md')),
    ).toBe(true);
  });

  test('install: file content matches source', () => {
    fs.writeFileSync(
      path.join(dir, 'qa-ai-rules.config.json'),
      JSON.stringify({ tools: { cursor: true, claude: true } }, null, 2),
    );
    runCli(['install'], dir);

    const cursorInstalled = fs.readFileSync(
      path.join(dir, CURSOR_DEST, 'qa-ai-rules--test-case-rules.mdc'),
      'utf8',
    );
    expect(cursorInstalled).toBe(
      fs.readFileSync(path.join(CURSOR_SRC, 'test-case-rules.mdc'), 'utf8'),
    );

    const claudeInstalled = fs.readFileSync(
      path.join(dir, CLAUDE_DEST, 'test-case-rules.md'),
      'utf8',
    );
    expect(claudeInstalled).toBe(
      fs.readFileSync(path.join(CLAUDE_SRC, 'test-case-rules.md'), 'utf8'),
    );
  });
});

// ─── Group 3: status command ──────────────────────────────────────────────────

test.describe('status command', () => {
  let dir: string;

  test.beforeEach(() => {
    dir = makeTempDir();
    writeGitignore(dir);
  });

  test.afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  test('status with no config: exits 0 and warns about missing config', () => {
    const result = runCli(['status'], dir);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('No config found');
  });

  test('status after cursor init: shows enabled tool and installed files', () => {
    runCli(['init', '--cursor'], dir);
    const result = runCli(['status'], dir);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Cursor IDE');
    expect(result.stdout).toContain('qa-ai-rules--test-case-rules.mdc');
  });

  test('status after claude init: shows enabled tool and installed files', () => {
    runCli(['init', '--claude'], dir);
    const result = runCli(['status'], dir);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Claude Code');
    expect(result.stdout).toContain('test-case-rules.md');
  });

  test('status after both tools init: shows both tools and all files', () => {
    runCli(['init', '--cursor', '--claude'], dir);
    const result = runCli(['status'], dir);
    expect(result.stdout).toContain('Cursor IDE');
    expect(result.stdout).toContain('Claude Code');
  });

  test('status reports gitignore health when rules are present', () => {
    runCli(['init', '--cursor'], dir);
    const result = runCli(['status'], dir);
    expect(result.stdout).toContain('.gitignore');
  });
});

// ─── Group 4: npm install via tgz (full postinstall hook) ─────────────────────

test.describe('npm install from tgz — full postinstall integration', () => {
  let dir: string;

  test.beforeEach(() => {
    dir = makeTempDir();
    fs.writeFileSync(
      path.join(dir, 'package.json'),
      JSON.stringify({ name: 'test-consuming-repo', version: '1.0.0', private: true }, null, 2),
    );
  });

  test.afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  test('npm install with no config: exits 0, creates no rule files', () => {
    test.setTimeout(180_000);
    const result = runNpm(['install', TGZ_PATH], dir);
    expect(result.status).toBe(0);
    expect(fs.existsSync(path.join(dir, '.cursor'))).toBe(false);
    expect(fs.existsSync(path.join(dir, '.claude'))).toBe(false);
  });

  test('npm install with cursor config: postinstall installs cursor files', () => {
    test.setTimeout(180_000);
    fs.writeFileSync(
      path.join(dir, 'qa-ai-rules.config.json'),
      JSON.stringify({ tools: { cursor: true, claude: false } }, null, 2),
    );
    const result = runNpm(['install', TGZ_PATH], dir);
    expect(result.status).toBe(0);

    const srcFiles = fs.readdirSync(CURSOR_SRC);
    for (const file of srcFiles) {
      expect(
        fs.existsSync(path.join(dir, CURSOR_DEST, `qa-ai-rules--${file}`)),
      ).toBe(true);
    }
  });

  test('npm install with claude config: postinstall installs claude files', () => {
    test.setTimeout(180_000);
    fs.writeFileSync(
      path.join(dir, 'qa-ai-rules.config.json'),
      JSON.stringify({ tools: { cursor: false, claude: true } }, null, 2),
    );
    const result = runNpm(['install', TGZ_PATH], dir);
    expect(result.status).toBe(0);

    const srcFiles = fs.readdirSync(CLAUDE_SRC);
    for (const file of srcFiles) {
      expect(fs.existsSync(path.join(dir, CLAUDE_DEST, file))).toBe(true);
    }
  });

  test('npm install with both tools config: postinstall installs all files', () => {
    test.setTimeout(180_000);
    fs.writeFileSync(
      path.join(dir, 'qa-ai-rules.config.json'),
      JSON.stringify({ tools: { cursor: true, claude: true } }, null, 2),
    );
    runNpm(['install', TGZ_PATH], dir);

    expect(
      fs.existsSync(path.join(dir, CURSOR_DEST, 'qa-ai-rules--test-case-rules.mdc')),
    ).toBe(true);
    expect(
      fs.existsSync(path.join(dir, CLAUDE_DEST, 'test-case-rules.md')),
    ).toBe(true);
  });
});

// ─── Group 5: CLI error handling ──────────────────────────────────────────────

test.describe('CLI error handling', () => {
  let dir: string;

  test.beforeEach(() => {
    dir = makeTempDir();
  });

  test.afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  test('unknown command: exits with code 1', () => {
    const result = runCli(['unknowncmd'], dir);
    expect(result.status).toBe(1);
  });

  test('--help: exits 0 and shows usage', () => {
    const result = runCli(['--help'], dir);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('qa-ai-rules');
  });

  test('--version: exits 0 and prints a version string', () => {
    const result = runCli(['--version'], dir);
    expect(result.status).toBe(0);
    expect(result.stdout).toMatch(/\d+\.\d+\.\d+/);
  });
});
