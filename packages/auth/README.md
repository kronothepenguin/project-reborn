# auth

Sign-in, sessions, access attributes and password resets, shared by the CMS, housekeeping and the installer.

How it works: `knowledge/index.md`.

Gates, from `packages/auth`:

```sh
gofmt -l .
go vet ./...
go test ./... -race
```
