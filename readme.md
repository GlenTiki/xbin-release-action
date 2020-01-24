## About

A GitHub Action for releasing a directory of executable binaries. Useful when using a cross compiler.

## Usage

Below is a simple snippet to cross compile a Golang app, and release it as needed.

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    strategy:
      matrix:
        go_version: [1.13.x]
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v1
      - name: Build with xgo
        uses: crazy-max/ghaction-xgo@v1
        with:
          xgo_version: latest
          go_version: ${{ matrix.go_version }}
          dest: build
          prefix: myapp
          targets: windows/386,windows/amd64,linux/386,linux/amd64,darwin/386,darwin/amd64
          v: true
          x: false
          ldflags: -s -w
      - name: Create Release
        uses: actions/create-release@v1.0.0
        id: create_release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          draft: false
          prerelease: false
      - name: Upload Release Assets
        uses: glentiki/xbin-release-action@v1.0.0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          upload_url: ${{ steps.create_release.outputs.upload_url }} # This pulls from the CREATE RELEASE step above, referencing it's ID to get its outputs object, which include a `upload_url`. See this blog post for more info: https://jasonet.co/posts/new-features-of-github-actions/#passing-data-to-future-steps
          assets_path: ./build

```

## Customizing

### inputs

Following inputs can be used as `step.with` keys

| Name            | Type    | Required              | Description                                                   |
|-----------------|---------|-----------------------|---------------------------------------------------------------|
| `upload_url`    | String  | `true`                | Github release upload url. Supplied via create release action |
| `assets_path`   | String  | `true`                | Path to directory of assets to upload                         |

## Limitations

Binaries that are uploaded as release artifacts may need to made executable before usage when downloaded.

## License

MIT. See `LICENSE` for more details.
