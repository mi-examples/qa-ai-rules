#!/usr/bin/env node
'use strict';

const { existsSync } = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const cliPath = path.join(__dirname, '..', 'dist', 'cli.js');

if (existsSync(cliPath)) {
  // npm sets INIT_CWD to the directory from which `npm install` was invoked.
  // Without it, process.cwd() inside the CLI would be the package's own
  // directory inside node_modules rather than the consuming repo root.
  const cwd = process.env.INIT_CWD || process.cwd();
  execSync(`node "${cliPath}" install`, { stdio: 'inherit', cwd });
}
