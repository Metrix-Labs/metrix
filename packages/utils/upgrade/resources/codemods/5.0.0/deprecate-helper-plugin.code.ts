import type { Transform } from 'jscodeshift';
import { changeImportSpecifier } from '../../utils/change-import';
import { replaceJSXElement } from '../../utils/replace-jsx';

/**
 * This codemods automates all the imports and naming changes
 * for methods or components that used to be imported from '@metrixlabs/helper-plugin'
 */
const transform: Transform = (file, api) => {
  const { j } = api;

  const root = j.withParser('tsx')(file.source);

  type Replacement = {
    oldName: string;
    oldDependency: string;
    toReplace: boolean;
    toChangeImportSpecifier: boolean;
    newDependency?: string;
    newName?: string;
    newImport?: string;
  };

  const replacements: Replacement[] = [
    {
      oldName: 'AnErrorOccurred',
      newImport: 'Page',
      newName: 'Page.Error',
      oldDependency: '@metrixlabs/helper-plugin',
      newDependency: '@metrixlabs/metrix/admin',
      toReplace: true,
      toChangeImportSpecifier: true,
    },
    {
      oldName: 'CheckPagePermissions',
      newImport: 'Page',
      newName: 'Page.Protect',
      oldDependency: '@metrixlabs/helper-plugin',
      newDependency: '@metrixlabs/metrix/admin',
      toReplace: true,
      toChangeImportSpecifier: true,
    },
    {
      oldName: 'ConfirmDialog',
      oldDependency: '@metrixlabs/helper-plugin',
      newDependency: '@metrixlabs/metrix/admin',
      toChangeImportSpecifier: true,
      toReplace: false,
    },
    {
      oldName: 'DateTimePicker',
      oldDependency: '@metrixlabs/helper-plugin',
      newDependency: '@strapi/design-system',
      toChangeImportSpecifier: true,
      toReplace: false,
    },
    {
      oldName: 'getFetchClient',
      oldDependency: '@metrixlabs/helper-plugin',
      newDependency: '@metrixlabs/metrix/admin',
      toChangeImportSpecifier: true,
      toReplace: false,
    },
    {
      oldName: 'LoadingIndicatorPage',
      newImport: 'Page',
      newName: 'Page.Loading',
      oldDependency: '@metrixlabs/helper-plugin',
      newDependency: '@metrixlabs/metrix/admin',
      toReplace: true,
      toChangeImportSpecifier: true,
    },
    {
      oldName: 'NoContent',
      newImport: 'EmptyStateLayout',
      newName: 'EmptyStateLayout',
      oldDependency: '@metrixlabs/helper-plugin',
      newDependency: '@strapi/design-system',
      toReplace: true,
      toChangeImportSpecifier: true,
    },
    {
      oldName: 'NoPermissions',
      newImport: 'Page',
      newName: 'Page.NoPermissions',
      oldDependency: '@metrixlabs/helper-plugin',
      newDependency: '@metrixlabs/metrix/admin',
      toReplace: true,
      toChangeImportSpecifier: true,
    },
    {
      oldName: 'Status',
      oldDependency: '@metrixlabs/helper-plugin',
      newDependency: '@strapi/design-system',
      toChangeImportSpecifier: true,
      toReplace: false,
    },
    {
      oldName: 'translatedErrors',
      oldDependency: '@metrixlabs/helper-plugin',
      newDependency: '@metrixlabs/metrix/admin',
      toChangeImportSpecifier: true,
      toReplace: false,
    },
    {
      oldName: 'useAPIErrorHandler',
      oldDependency: '@metrixlabs/helper-plugin',
      newDependency: '@metrixlabs/metrix/admin',
      toChangeImportSpecifier: true,
      toReplace: false,
    },
    {
      oldName: 'useCallbackRef',
      oldDependency: '@metrixlabs/helper-plugin',
      newDependency: '@strapi/design-system',
      toChangeImportSpecifier: true,
      toReplace: false,
    },
    {
      oldName: 'useCollator',
      oldDependency: '@metrixlabs/helper-plugin',
      newDependency: '@strapi/design-system',
      toChangeImportSpecifier: true,
      toReplace: false,
    },
    {
      oldName: 'useFetchClient',
      oldDependency: '@metrixlabs/helper-plugin',
      newDependency: '@metrixlabs/metrix/admin',
      toChangeImportSpecifier: true,
      toReplace: false,
    },
    {
      oldName: 'useFilter',
      oldDependency: '@metrixlabs/helper-plugin',
      newDependency: '@strapi/design-system',
      toChangeImportSpecifier: true,
      toReplace: false,
    },
    {
      oldName: 'useQueryParams',
      oldDependency: '@metrixlabs/helper-plugin',
      newDependency: '@metrixlabs/metrix/admin',
      toChangeImportSpecifier: true,
      toReplace: false,
    },
    {
      oldName: 'useRBAC',
      oldDependency: '@metrixlabs/helper-plugin',
      newDependency: '@metrixlabs/metrix/admin',
      toChangeImportSpecifier: true,
      toReplace: false,
    },
    {
      oldName: 'SearchURLQuery',
      oldDependency: '@metrixlabs/helper-plugin',
      newDependency: '@metrixlabs/metrix/admin',
      toChangeImportSpecifier: true,
      toReplace: false,
    },
    {
      oldName: 'useSettingsForm',
      oldDependency: '@metrixlabs/helper-plugin',
      newDependency: '@metrixlabs/metrix/admin',
      toChangeImportSpecifier: true,
      toReplace: false,
    },
  ];

  replacements.forEach((replacement) => {
    if (replacement.toReplace && replacement.newName) {
      replaceJSXElement(root, j, {
        oldElementName: replacement.oldName,
        newElementName: replacement.newName,
        oldDependency: replacement.oldDependency,
      });
    }

    if (replacement.toChangeImportSpecifier && replacement.newDependency) {
      changeImportSpecifier(root, j, {
        oldMethodName: replacement.oldName,
        newMethodName: replacement.newImport,
        oldDependency: replacement.oldDependency,
        newDependency: replacement.newDependency,
      });
    }
  });

  return root.toSource();
};

export default transform;
