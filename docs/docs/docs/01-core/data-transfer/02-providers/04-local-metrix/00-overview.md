---
title: Overview
tags:
  - experimental
  - providers
  - import
  - export
  - data-transfer
---

# Local Metrix Providers

The local Metrix provider allows using the local Metrix instance (the same project that the data transfer engine is being run from) as a data source.

Creating a local Metrix data provider requires passing in an initialized `metrix` server object to interact with that server's Entity Service and Query Engine to manage the data. Therefore if the local Metrix project cannot be started (due to errors), the providers cannot be used.

**Important**: When a transfer completes, the `metrix` object passed in is shut down automatically based on the `autoDestroy` option. If you are running a transfer via an external script, it is recommended to use `autoDestroy: true` to ensure it is shut down properly, but if you are running a transfer within a currently running Metrix instance you should set `autoDestroy: false` or your Metrix instance will be shut down at the end of the transfer.
