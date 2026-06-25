# XanaNode Protocol Substrate

This folder is the explicit substrate source generated from the XanaNode Protocol repository.

It exists so the rest of the stack can federate with the protocol as a normal substrate instead of treating the protocol repository as a private implementation detail.

Regenerate it from the repository root with:

```powershell
node XanaNode-Protocol/tools/build-substrate-source.mjs
```

Or from `XanaNode-Master`:

```powershell
npm run protocol:build-substrate-source
```
