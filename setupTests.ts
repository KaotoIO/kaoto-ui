import { stepsCatalog } from './src/stubs';
import '@testing-library/jest-dom';
import { TextEncoder } from 'util';
import 'whatwg-fetch';

global.TextEncoder = TextEncoder;
global.KAOTO_VERSION = '1.0-test';

jest.mock('@kaoto/api', () => {
  const actual = jest.requireActual('@kaoto/api');

  return {
    ...actual,
    fetchCatalogSteps: jest.fn().mockResolvedValue(stepsCatalog),
  };
});
