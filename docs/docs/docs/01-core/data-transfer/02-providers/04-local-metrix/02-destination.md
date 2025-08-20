---
title: Destination
tags:
  - providers
  - data-transfer
  - experimental
---

# Local Metrix Destination Provider

This provider will insert data into an initialized `metrix` instance using its Entity Service and Query Engine.

## Provider Options

The accepted options are defined in `ILocalFileSourceProviderOptions`.

```typescript
  getStrapi(): Metrix.Metrix | Promise<Metrix.Metrix>; // return an initialized instance of Metrix
  autoDestroy?: boolean; // shut down the instance returned by getStrapi() at the end of the transfer
  restore?: restore.IRestoreOptions; // the options to use when strategy is 'restore'
  strategy: 'restore'; // conflict management strategy; only the restore strategy is available at this time
```

`strategy` defines the conflict management strategy used. Currently, only `"restore"` is available as an option.

### Restore

A conflict management strategy of "restore" deletes all existing Metrix data before a transfer to avoid any conflicts.

The following restore options are available:

```typecript
export interface IRestoreOptions {
  assets?: boolean; // delete media library files before transfer
  configuration?: {
    webhook?: boolean; // delete webhooks before transfer
    coreStore?: boolean; // delete core store before transfer
  };
  entities?: {
    include?: string[]; // only delete these stage entities before transfer
    exclude?: string[]; // exclude these stage entities from deletion
    filters?: ((contentType: ContentTypeSchema) => boolean)[]; // custom filters to exclude a content type from deletion
    params?: { [uid: string]: unknown }; // params object passed to deleteMany before transfer for custom deletions
  };
}
```

### Rollbacks

This local Metrix destination provider automatically provides a rollback mechanism on error.

For Metrix data, that is done with a database transaction wrapped around the restore and the insertion of data and committing on succes and rolling back on failure.

For Metrix assets (ie, the media library files) this is done by attempting to temporarily move the existing assets to a backup directory to `uploads_backup_{timestamp}`, and then deleting it on success, or deleting the failed import files and putting the backup back into place on failure. In some cases of failure, it may be impossible to move the backup files back into place, so you will need to manually restore the backup assets files.

Note: Because of the need for write access, environments without filesystem permissions to move the assets folder (common for virtual environments where /uploads is mounted as a read-only drive) will be unable to include assets in a transfer and the asset stage must be excluded in order to run the transfer.
