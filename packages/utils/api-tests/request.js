'use strict';

const { createAgent } = require('./agent');
const { superAdmin } = require('./metrix');

const CONTENT_API_URL_PREFIX = '/api';

const createRequest = ({ metrix } = {}) => createAgent(metrix);

const createContentAPIRequest = ({ metrix, auth = {} } = {}) => {
  const { token } = auth;

  if (token) {
    return createAgent(metrix, { urlPrefix: CONTENT_API_URL_PREFIX, token });
  }

  // Default content api agent
  return createAgent(metrix, { urlPrefix: CONTENT_API_URL_PREFIX, token: 'test-token' });
};

const createAuthRequest = ({ metrix, userInfo = superAdmin.credentials, state = {} }) => {
  return createAgent(metrix, state).login(userInfo);
};

// TODO: Remove
const transformToRESTResource = (input) => {
  if (Array.isArray(input)) {
    return input.map((value) => transformToRESTResource(value));
  }

  return input;
};

module.exports = {
  createRequest,
  createContentAPIRequest,
  createAuthRequest,
  transformToRESTResource,
};
