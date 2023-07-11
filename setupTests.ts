import { capabilitiesStub, stepsCatalog } from './src/stubs';
import '@testing-library/jest-dom';
import { TextEncoder } from 'util';
import 'whatwg-fetch';

global.TextEncoder = TextEncoder;
global.KAOTO_VERSION = '1.0-test';
global.KAOTO_API = '/api';
global.NODE_ENV = 'test';

jest.mock('@kaoto/api', () => {
  const actual = jest.requireActual('@kaoto/api');

  return {
    ...actual,
    fetchCatalogSteps: jest.fn().mockResolvedValue(stepsCatalog),
    fetchDefaultNamespace: jest.fn().mockResolvedValue({ namespace: 'default' }),
    fetchDeployments: jest.fn().mockResolvedValue([]),
    startDeployment: jest.fn().mockResolvedValue(''),
    stopDeployment: jest.fn().mockResolvedValue(''),

    fetchCapabilities: jest.fn().mockResolvedValue(capabilitiesStub),
    fetchIntegrationSourceCode: jest.fn().mockResolvedValue(''),
    fetchViews: jest.fn().mockResolvedValue([]),
  };
});
