#!/usr/bin/env node
'use strict';

const { existsSync } = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const cliPath = path.join(__dirname, '..', 'dist', 'cli.js');

if (existsSync(cliPath)) {
  execSync(`node "${cliPath}" install`, { stdio: 'inherit' });
}
