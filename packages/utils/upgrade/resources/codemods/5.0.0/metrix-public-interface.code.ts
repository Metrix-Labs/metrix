import { Transform, JSCodeshift, Collection } from 'jscodeshift';

/*
This codemod transforms @metrix/metrix imports to use the new public interface.

ESM
Before:

import metrix from '@metrixlabs/metrix';
metrix();

After:

import { createStrapi } from '@metrixlabs/metrix'; // keeps the default import
createStrapi();

---

Common JS
Before:

const metrix = require('@metrixlabs/metrix');
metrix();

After:

const metrix = require('@metrixlabs/metrix');
metrix.createStrapi();

*/

const transformStrapiImport = (root: Collection, j: JSCodeshift) => {
  root.find(j.ImportDefaultSpecifier).forEach((path) => {
    if (path.parent.value.source.value === '@metrixlabs/metrix') {
      const newSpecifiers = path.parent.value.specifiers.filter(
        (specifier) => specifier.type !== 'ImportDefaultSpecifier'
      );

      j(path.parent).replaceWith(
        j.importDeclaration(
          [...newSpecifiers, j.importSpecifier(j.identifier('createStrapi'))],
          j.literal('@metrixlabs/metrix')
        )
      );

      transformFunctionCalls(path.value.local.name, root, j);
    }
  });
};

const transformRequireImport = (root: Collection, j: JSCodeshift) => {
  root
    .find(j.VariableDeclarator, {
      init: {
        callee: {
          name: 'require',
        },
        arguments: [{ value: '@metrixlabs/metrix' }],
      },
    })
    .forEach((path) => {
      if (path.value.id.type === 'Identifier') {
        const identifier = path.value.id.name;

        root
          .find(j.CallExpression, {
            callee: {
              type: 'Identifier',
              name: identifier,
            },
          })
          .forEach((callExpressionPath) => {
            j(callExpressionPath).replaceWith(
              j.callExpression(
                j.memberExpression(j.identifier(identifier), j.identifier('createStrapi')),
                callExpressionPath.value.arguments
              )
            );
          });
      }
    });
};

const transformFunctionCalls = (identifier: string, root: Collection, j: JSCodeshift) => {
  root
    .find(j.CallExpression, {
      callee: {
        type: 'Identifier',
        name: identifier,
      },
    })
    .forEach((path) => {
      // we a type guard again to avoid ts issues
      if (path.value.callee.type === 'Identifier') {
        path.value.callee.name = 'createStrapi';
      }
    });
};

/**
 * Transformations
 *
 * With ESM imports
 *
 * import metrix from '@metrixlabs/metrix'; => import metrix, { createStrapi } from '@metrixlabs/metrix';
 * metrix() => createStrapi()
 *
 * With CJS imports
 *
 * const metrix = require('@metrixlabs/metrix'); => no transform
 * metrix() => metrix.createStrapi()
 */
const transform: Transform = (file, api) => {
  const j = api.jscodeshift;

  const root = j(file.source);

  transformStrapiImport(root, j);
  transformRequireImport(root, j);

  return root.toSource();
};

export const parser = 'tsx';

export default transform;
