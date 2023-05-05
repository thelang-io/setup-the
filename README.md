# setup-the

[![test](https://github.com/thelang-io/setup-the/actions/workflows/test.yml/badge.svg)](https://github.com/thelang-io/setup-the/actions/workflows/test.yml)

This action provides the following functionality for GitHub Actions users:
- Downloads, caches, and adds The programming language to the PATH

## Usage
See [action.yml](action.yml)

```yaml
steps:
  - uses: actions/checkout@v3

  - uses: actions/setup-the@v1
    with:
      # Version of The programming language.
      # Needs to be exact version, will not work otherwise.
      # Examples: 0.13.0, 0.13.1, latest
      the-version: 0.13.0

  - run: npm ci
  - run: npm test
```

The `the-version` input is optional. If not supplied, the latest version will be installed.

## License
The scripts and documentation in this project are released under the [MIT License](LICENSE.txt)
