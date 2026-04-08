'use strict';

const isMain = process.env.GITHUB_REF === 'refs/heads/main';

/** @type {import('semantic-release').GlobalConfig} */
module.exports = {
  branches: [
    'main',
    { name: 'develop', prerelease: 'beta', channel: 'beta' },
  ],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/changelog',
    ['@semantic-release/npm', { npmPublish: isMain }],
    [
      '@semantic-release/git',
      {
        assets: ['CHANGELOG.md', 'package.json', 'package-lock.json'],
        message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ],
  ],
};
