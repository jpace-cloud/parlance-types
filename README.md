# @parlance/types

Shared TypeScript types for the Parlance ecosystem.

## Install

```bash
npm install git+ssh://git@github.com/jpace-cloud/parlance-types.git#<sha-or-tag>
```

The `prepare` lifecycle script runs `tsc` after install, so consumers receive
compiled `dist/` output without committing it.

## Exports

- `Origin` — discriminated union of contract origin sources
  - Client-producible: `figma_frame`, `live_url`, `image_upload`, `code_component`, `generated`
  - Server-managed: `legacy` (migration only), `unspecified` (API auto-stamp on writes that omit origin)
- `ClientOrigin` — subset of `Origin` excluding server-managed types
- `SnapshotRef`, `TokenRef`, `ComponentRef` — supporting types

## Swift mirror

The Swift port of `Origin` lives at:

```
xcode/Sources/ParlanceKit/Models/Origin.swift
```

Both files are manually kept in sync. When changing the union, update both
files in the same logical change set. Each file carries a reciprocal comment
naming the other.

## Roadmap

> **Planned — not yet implemented.** The `./schemas` entry point below does not
> exist yet: `zod` is not a dependency and there is no `./schemas` export in
> `package.json`. Do not import it until this ships.

PR 2 will add a `./schemas` entry point exporting:

- `OriginSchema` — full union, used for parsing reads
- `ClientOriginSchema` — five-variant subset used for validating write request bodies

Schemas will be defined as `z.discriminatedUnion`, with TS types derived via
`z.infer<>`. The separate entry point exists so client bundles (Figma plugin,
browser extension, VS Code) import only types and never drag zod into their
runtime.
