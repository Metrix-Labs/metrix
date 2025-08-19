'use strict';

const fs = require('fs');
const path = require('path');

const { createTestBuilder } = require('api-tests/builder');
const { createStrapiInstance } = require('api-tests/metrix');
const { createAuthRequest } = require('api-tests/request');

const builder = createTestBuilder();
let metrix;
let rq;

describe('Dimensions are populated when uploading an image', () => {
  beforeAll(async () => {
    metrix = await createStrapiInstance();
    rq = await createAuthRequest({ metrix });
  });

  afterAll(async () => {
    await metrix.destroy();
    await builder.cleanup();
  });

  test.each([['.jpg'], ['.png'], ['.webp'], ['.tiff'], ['.svg'], ['.gif']])(
    'Dimensions are populated for %s',
    async (ext) => {
      const res = await rq({
        method: 'POST',
        url: '/upload',
        formData: { files: fs.createReadStream(path.join(__dirname, `../utils/metrix${ext}`)) },
      });

      expect(res.statusCode).toBe(201);
      expect(res.body[0]).toMatchObject({
        width: 256,
        height: 256,
        ext,
      });
    }
  );
});
