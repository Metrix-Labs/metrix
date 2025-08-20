import { join } from 'path';
import _ from 'lodash';

import { errors } from '@metrixlabs/utils';
import createSchemaHandler from './schema-handler';
import createComponentBuilder from './component-builder';
import createContentTypeBuilder from './content-type-builder';

/**
 * Creates a content type schema builder instance
 */
export default function createBuilder() {
  const components = Object.values(strapi.components as Record<string, any>).map(
    (componentInput: any) => ({
      category: componentInput.category,
      modelName: componentInput.modelName,
      plugin: componentInput.modelName,
      uid: componentInput.uid,
      filename: componentInput.__filename__,
      dir: join(strapi.dirs.app.components, componentInput.category),
      schema: componentInput.__schema__,
      config: componentInput.config,
    })
  );

  const contentTypes = Object.values<any>(strapi.contentTypes).map((contentTypeInput: any) => {
    const dir = contentTypeInput.plugin
      ? join(
          strapi.dirs.app.extensions,
          contentTypeInput.plugin,
          'content-types',
          contentTypeInput.info.singularName
        )
      : join(
          strapi.dirs.app.api,
          contentTypeInput.apiName,
          'content-types',
          contentTypeInput.info.singularName
        );

    return {
      modelName: contentTypeInput.modelName,
      plugin: contentTypeInput.plugin,
      uid: contentTypeInput.uid,
      filename: 'schema.json',
      dir,
      schema: contentTypeInput.__schema__,
      config: contentTypeInput.config,
    };
  });

  return createSchemaBuilder({
    components,
    contentTypes,
  });
}

type SchemaBuilderOptions = {
  components: any;
  contentTypes: any;
};

function createSchemaBuilder({ components, contentTypes }: SchemaBuilderOptions) {
  const tmpComponents = new Map();
  const tmpContentTypes = new Map();

  // init temporary ContentTypes
  Object.keys(contentTypes).forEach((key) => {
    tmpContentTypes.set(
      (contentTypes as any)[key].uid,
      createSchemaHandler((contentTypes as any)[key])
    );
  });

  // init temporary components
  Object.keys(components).forEach((key) => {
    tmpComponents.set((components as any)[key].uid, createSchemaHandler((components as any)[key]));
  });

  return {
    get components() {
      return tmpComponents;
    },
    get contentTypes() {
      return tmpContentTypes;
    },

    /**
     * Convert Attributes received from the API to the right syntax
     */
    convertAttributes(attributes: any) {
      return Object.keys(attributes).reduce(
        (acc, key) => {
          (acc as any)[key] = this.convertAttribute((attributes as any)[key]);
          return acc;
        },
        {} as Record<string, unknown>
      );
    },

    convertAttribute(attribute: any) {
      const { configurable, private: isPrivate, conditions } = attribute as any;

      const baseProperties = {
        private: isPrivate === true ? true : undefined,
        configurable: configurable === false ? false : undefined,
        // IMPORTANT: Preserve conditions only if they exist and are not undefined/null
        ...(conditions !== undefined && conditions !== null && { conditions }),
      } as any;

      if ((attribute as any).type === 'relation') {
        const { target, relation, targetAttribute, dominant, ...restOfProperties } =
          attribute as any;

        const attr: any = {
          type: 'relation',
          relation,
          target,
          ...restOfProperties,
          ...baseProperties,
        };

        // TODO: uncomment this when we pre-create empty types and targets exists if we create multiple types at once
        // if (target && !this.contentTypes.has(target)) {
        //   throw new errors.ApplicationError(`target: ${target} does not exist`);
        // }

        if (_.isNil(targetAttribute)) {
          return attr;
        }

        if (['oneToOne', 'manyToMany'].includes(relation) && dominant === true) {
          attr.inversedBy = targetAttribute;
        } else if (['oneToOne', 'manyToMany'].includes(relation) && dominant === false) {
          attr.mappedBy = targetAttribute;
        } else if (['oneToOne', 'manyToOne', 'manyToMany'].includes(relation)) {
          attr.inversedBy = targetAttribute;
        } else if (['oneToMany'].includes(relation)) {
          attr.mappedBy = targetAttribute;
        }

        return attr;
      }

      return {
        ...(attribute as any),
        ...baseProperties,
      };
    },

    ...createComponentBuilder(),
    ...createContentTypeBuilder(),

    /**
     * Write all type to files
     */
    writeFiles() {
      const schemas = [
        ...Array.from(tmpComponents.values()),
        ...Array.from(tmpContentTypes.values()),
      ];

      return Promise.all(schemas.map((schema: any) => schema.flush()))
        .catch((error: any) => {
          strapi.log.error('Error writing schema files');
          strapi.log.error(error);
          return this.rollback();
        })
        .catch((error: any) => {
          strapi.log.error(
            'Error rolling back schema files. You might need to fix your files manually'
          );
          strapi.log.error(error);

          throw new errors.ApplicationError('Invalid schema edition');
        });
    },

    /**
     * rollback all files
     */
    rollback() {
      return Promise.all(
        [...Array.from(tmpComponents.values()), ...Array.from(tmpContentTypes.values())].map(
          (schema: any) => schema.rollback()
        )
      );
    },
  };
}
