# Changelog

## [1.2.1](https://github.com/mi-examples/qa-ai-rules/compare/v1.2.0...v1.2.1) (2026-09-25)

### Features

- Beta publishing: pushes to `develop` with releasable commits now publish `X.Y.Z-beta.N` to npm under the `beta` dist-tag and create a GitHub prerelease, and can be installed with `npm install `@metricinsights/qa-ai-rules`@beta`.

### Bug fixes

- Fixed noisy npm publish warnings by normalizing `package.json` fields: the `bin` entry for `qa-ai-rules` is now `dist/cli.js` (removed leading `./`) and `repository.url` is `git+ with no change to the published manifest.

# [1.2.0-beta.1](https://github.com/mi-examples/qa-ai-rules/compare/v1.1.0...v1.2.0-beta.1) (2026-09-24)


### Bug Fixes

* **deps:** upgrade semantic-release to 25 to clear audit findings ([29b1a84](https://github.com/mi-examples/qa-ai-rules/commit/29b1a8446b04e304e3e3402c6686ca7f5076e0b5))
* **postinstall:** run the CLI without a shell ([f541a50](https://github.com/mi-examples/qa-ai-rules/commit/f541a50955569305267ec268b7005bbc05e9739d))


### Features

* **deps:** upgrade @clack/prompts to 1 and cac to 7 ([f7c37e2](https://github.com/mi-examples/qa-ai-rules/commit/f7c37e21a5f161f325b3774d2c255a82292197b1))

# [1.1.0-beta.1](https://github.com/mi-examples/qa-ai-rules/compare/v1.0.1...v1.1.0-beta.1) (2026-05-22)


### Features

* **rules:** add bug report template ([7bf6a92](https://github.com/mi-examples/qa-ai-rules/commit/7bf6a92d3ca7af5d8115a28f13212e5ca0c45b9c))
* **rules:** add optional preconditions to bug report template ([10477d8](https://github.com/mi-examples/qa-ai-rules/commit/10477d8015a99445121027fcc942319d3ed705c2))

# 1.0.0-beta.1 (2026-04-08)


### Bug Fixes

* **cli:** exit with code 1 for unknown commands ([c07a696](https://github.com/mi-examples/qa-ai-rules/commit/c07a696b73841b976584cd713f17b5073e1c118b))
* **postinstall:** use INIT_CWD for correct cwd in consuming repos ([6f6588b](https://github.com/mi-examples/qa-ai-rules/commit/6f6588bad6985a9bd5f232153e4b9cef9474b305))


### Features

* initial release of qa-ai-rules CLI ([bfd7c1e](https://github.com/mi-examples/qa-ai-rules/commit/bfd7c1e18eea82421a841b1486bff285a9ddd735))

# 1.0.0 (2026-04-08)


### Features

* initial release of qa-ai-rules CLI ([bfd7c1e](https://github.com/mi-examples/qa-ai-rules/commit/bfd7c1e18eea82421a841b1486bff285a9ddd735))
