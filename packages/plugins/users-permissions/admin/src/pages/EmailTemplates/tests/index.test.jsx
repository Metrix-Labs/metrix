import * as React from 'react';

import { render, screen, waitFor } from '@metrixlabs/metrix/admin/test';

import { EmailTemplatesPage } from '../index';

/**
 * Mock the cropper import to avoid having an error
 */
jest.mock('cropperjs/dist/cropper.css?raw', () => '', {
  virtual: true,
});

jest.mock('@metrixlabs/metrix/admin', () => ({
  ...jest.requireActual('@metrixlabs/metrix/admin'),
  useRBAC: jest.fn().mockImplementation(() => ({
    isLoading: false,
    allowedActions: { canUpdate: true },
  })),
}));

describe('ADMIN | Pages | Settings | Email Templates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('renders and matches the snapshot', async () => {
    render(<EmailTemplatesPage />);

    await waitFor(() => {
      expect(screen.getByText('Reset password')).toBeInTheDocument();
    });
  });
});
