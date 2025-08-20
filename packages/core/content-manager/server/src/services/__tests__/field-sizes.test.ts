import { errors } from '@metrixlabs/utils';
import createFieldSizesService from '../field-sizes';

const { ApplicationError } = errors;

const metrix = {
  // Mock container.get('custom-fields')
  get: jest.fn(() => ({
    // Mock container.get('custom-fields').getAll()
    getAll: jest.fn(() => ({
      'plugin::mycustomfields.color': {
        name: 'color',
        plugin: 'mycustomfields',
        type: 'string',
      },
      'plugin::mycustomfields.smallColor': {
        name: 'smallColor',
        plugin: 'mycustomfields',
        type: 'string',
        inputSize: {
          default: 4,
          isResizable: false,
        },
      },
    })),
  })),
} as any;

describe('field sizes service', () => {
  it('should return the correct field sizes', () => {
    const { getAllFieldSizes } = createFieldSizesService({ metrix });
    const fieldSizes = getAllFieldSizes();
    Object.values(fieldSizes).forEach((fieldSize: any) => {
      expect(typeof fieldSize.isResizable).toBe('boolean');
      expect([4, 6, 8, 12]).toContain(fieldSize.default);
    });
  });

  it('should return the correct field size for a given type', () => {
    const { getFieldSize } = createFieldSizesService({ metrix });
    const fieldSize = getFieldSize('string');
    expect(fieldSize.isResizable).toBe(true);
    expect(fieldSize.default).toBe(6);
  });

  it('should throw an error if the type is not found', () => {
    const { getFieldSize } = createFieldSizesService({ metrix });

    try {
      getFieldSize('not-found');
    } catch (error: any) {
      expect(error instanceof ApplicationError).toBe(true);
      expect(error.message).toBe('Could not find field size for type not-found');
    }
  });

  it('should throw an error if the type is not provided', () => {
    const { getFieldSize } = createFieldSizesService({ metrix });

    try {
      getFieldSize();
    } catch (error: any) {
      expect(error instanceof ApplicationError).toBe(true);
      expect(error.message).toBe('The type is required');
    }
  });

  it('should set the custom fields input sizes', () => {
    const { setCustomFieldInputSizes, getAllFieldSizes } = createFieldSizesService({ metrix });
    setCustomFieldInputSizes();
    const fieldSizes = getAllFieldSizes();

    expect(fieldSizes).not.toHaveProperty('plugin::mycustomfields.color');
    expect(fieldSizes['plugin::mycustomfields.smallColor']?.default).toBe(4);
    expect(fieldSizes['plugin::mycustomfields.smallColor']?.isResizable).toBe(false);
  });
});
