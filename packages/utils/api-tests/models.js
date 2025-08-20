'use strict';

const { isFunction, isNil, prop } = require('lodash/fp');
const { createStrapiInstance } = require('./metrix');
const componentData = require('../../core/core/src/services/document-service/components');

const toContentTypeUID = (name) => {
  return name.includes('::') ? name : `api::${name}.${name}`;
};

const toCompoUID = (name) => {
  return `default.${name}`;
};

const createHelpers = async ({ metrix: strapiInstance = null, ...options } = {}) => {
  const metrix = strapiInstance || (await createStrapiInstance(options));
  const contentTypeService = metrix.plugin('content-type-builder').service('content-types');
  const componentsService = metrix.plugin('content-type-builder').service('components');

  const cleanup = async () => {
    if (isNil(strapiInstance)) {
      await metrix.destroy();
    }
  };

  return {
    metrix,
    contentTypeService,
    componentsService,
    cleanup,
  };
};

const createContentType = async (model, { metrix } = {}) => {
  const { contentTypeService, cleanup } = await createHelpers({ metrix });

  const contentType = await contentTypeService.createContentType({
    contentType: {
      ...model,
    },
  });

  await cleanup();

  return contentType;
};

const createContentTypes = async (models, { metrix } = {}) => {
  const { contentTypeService, cleanup } = await createHelpers({ metrix });

  const contentTypes = await contentTypeService.createContentTypes(
    models.map((model) => ({
      contentType: {
        ...model,
      },
    }))
  );

  await cleanup();

  return contentTypes;
};

const createComponent = async (component, { metrix } = {}) => {
  const { componentsService, cleanup } = await createHelpers({ metrix });

  const createdComponent = await componentsService.createComponent({
    component: {
      category: 'default',
      icon: 'default',
      ...component,
    },
  });

  await cleanup();

  return createdComponent;
};

const createComponents = async (components, { metrix } = {}) => {
  const createdComponents = [];

  for (const component of components) {
    createdComponents.push(await createComponent(component, { metrix }));
  }

  return createdComponents;
};

const deleteComponent = async (componentUID, { metrix } = {}) => {
  const { componentsService, cleanup } = await createHelpers({ metrix });

  const component = await componentsService.deleteComponent(componentUID);

  await cleanup();

  return component;
};

const deleteComponents = async (componentsUID, { metrix } = {}) => {
  const deletedComponents = [];

  for (const componentUID of componentsUID) {
    deletedComponents.push(await deleteComponent(componentUID, { metrix }));
  }

  return deletedComponents;
};

const deleteContentType = async (uid, { metrix } = {}) => {
  const { contentTypeService, cleanup } = await createHelpers({ metrix });

  const contentType = await contentTypeService.deleteContentType(uid);

  await cleanup();

  return contentType;
};

const deleteContentTypes = async (modelsUIDs, { metrix } = {}) => {
  const { contentTypeService, cleanup } = await createHelpers({ metrix });

  const contentTypes = await contentTypeService.deleteContentTypes(modelsUIDs);

  await cleanup();

  return contentTypes;
};

async function cleanupModel(uid, { metrix: strapiIst } = {}) {
  const { metrix, cleanup } = await createHelpers({ metrix: strapiIst });

  await metrix.db.query(uid).deleteMany();

  await cleanup();
}

async function cleanupModels(models, { metrix } = {}) {
  for (const model of models) {
    await cleanupModel(model, { metrix });
  }
}

async function createFixtures(dataMap, { metrix: strapiIst } = {}) {
  const { metrix, cleanup } = await createHelpers({ metrix: strapiIst });
  const models = Object.keys(dataMap);
  const resultMap = {};

  for (const model of models) {
    const entries = [];

    for (const data of dataMap[model]) {
      entries.push(await metrix.db.query(toContentTypeUID(model)).create({ data }));
    }

    resultMap[model] = entries;
  }

  await cleanup();

  return resultMap;
}

async function createFixturesFor(model, entries, { metrix: strapiIst } = {}) {
  const { metrix, cleanup } = await createHelpers({ metrix: strapiIst });

  const uid = toContentTypeUID(model);
  const contentType = metrix.getModel(uid);

  const results = [];

  for (const entry of entries) {
    const dataToCreate = isFunction(entry) ? entry(results) : entry;

    const componentValidData = await componentData.createComponents(uid, dataToCreate);
    const entryData = Object.assign(
      componentData.omitComponentData(contentType, dataToCreate),
      componentValidData
    );

    const res = await metrix.db.query(uid).create({ data: entryData });

    results.push(res);
  }

  await cleanup();

  return results;
}

async function deleteFixturesFor(model, entries, { metrix: strapiIst } = {}) {
  const { metrix, cleanup } = await createHelpers({ metrix: strapiIst });

  await metrix.db
    .query(toContentTypeUID(model))
    .deleteMany({ where: { id: entries.map(prop('id')) } });

  await cleanup();
}

async function modifyContentType(data, { metrix } = {}) {
  const { contentTypeService, cleanup } = await createHelpers({ metrix });

  const sanitizedData = { ...data };
  delete sanitizedData.editable;
  delete sanitizedData.restrictRelationsTo;

  const uid = toContentTypeUID(sanitizedData.singularName);

  const ct = await contentTypeService.editContentType(uid, {
    contentType: {
      ...sanitizedData,
    },
  });

  await cleanup();

  return ct;
}

async function modifyComponent(data, { metrix } = {}) {
  const { componentsService, cleanup } = await createHelpers({ metrix });

  const sanitizedData = { ...data };
  delete sanitizedData.editable;
  delete sanitizedData.restrictRelationsTo;

  const uid = toCompoUID(sanitizedData.displayName);

  const compo = await componentsService.editComponent(uid, {
    component: {
      ...sanitizedData,
    },
  });

  await cleanup();

  return compo;
}

async function getContentTypeSchema(modelName, { metrix: strapiIst } = {}) {
  const { metrix, contentTypeService, cleanup } = await createHelpers({ metrix: strapiIst });

  const uid = toContentTypeUID(modelName);
  const ct = contentTypeService.formatContentType(metrix.contentTypes[uid]);

  await cleanup();

  return (ct || {}).schema;
}

module.exports = {
  toContentTypeUID,
  // Create Content-Types
  createContentType,
  createContentTypes,
  // Delete Content-Types
  deleteContentType,
  deleteContentTypes,
  // Cleanup Models
  cleanupModel,
  cleanupModels,
  // Create Components
  createComponent,
  createComponents,
  // Delete Components
  deleteComponent,
  deleteComponents,
  // Fixtures
  createFixtures,
  createFixturesFor,
  deleteFixturesFor,
  // Update
  modifyContentType,
  modifyComponent,
  // Misc
  getContentTypeSchema,
};
