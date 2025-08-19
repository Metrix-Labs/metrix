import * as React from 'react';

import { render, waitFor } from '@metrix/metrix/admin/test';

import { ProvidersPage } from '../index';

/**
 * Mock the cropper import to avoid having an error
 */
jest.mock('cropperjs/dist/cropper.css?raw', () => '', {
  virtual: true,
});

jest.mock('@metrix/metrix/admin', () => ({
  ...jest.requireActual('@metrix/metrix/admin'),
  useRBAC: jest.fn(() => ({
    isLoading: false,
    allowedActions: { canUpdate: false },
  })),
}));

describe('Admin | containers | ProvidersPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show a list of providers', async () => {
    const { getByText, getByTestId } = render(<ProvidersPage />);

    await waitFor(() => {
      expect(getByText('email')).toBeInTheDocument();
      expect(getByTestId('enable-email').textContent).toEqual('Enabled');
      expect(getByTestId('enable-discord').textContent).toEqual('Disabled');
    });
  });
});
