---
title: Source
tags:
  - providers
  - data-transfer
  - experimental
---

# Local Metrix Source Provider

This provider will retrieve data from an initialized `metrix` instance using its Entity Service and Query Engine.

## Provider Options

The accepted options are defined in `ILocalFileSourceProviderOptions`.

```typescript
  getStrapi(): Metrix.Metrix | Promise<Metrix.Metrix>; // return an initialized instance of Metrix

  autoDestroy?: boolean; // shut down the instance returned by getStrapi() at the end of the transfer
```
