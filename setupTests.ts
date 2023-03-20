import '@testing-library/jest-dom';
import { TextEncoder } from 'util';
import 'whatwg-fetch';
import { stepsCatalog } from './src/stubs/steps';

global.TextEncoder = TextEncoder;

jest.mock('@kaoto/api', () => {
  const actual = jest.requireActual('@kaoto/api');

  return {
    ...actual,
    fetchCatalogSteps: jest.fn().mockResolvedValue(stepsCatalog),
  };
});
