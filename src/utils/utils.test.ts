import nestedBranch from '../store/data/kamelet.nested-branch.steps';
import {
  accessibleRouteChangeHandler,
  findPath,
  formatDateTime,
  getDeepValue,
  getDescriptionIfExists,
  getRandomArbitraryNumber,
  setDeepValue,
  shorten,
  truncateString,
} from './utils';
import { IIntegration } from '@kaoto/types';

describe('utils', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('should schedule a focus on the main container', () => {
    const mainContainer = { focus: jest.fn() };
    jest
      .spyOn(document, 'getElementById')
      .mockReturnValueOnce(mainContainer as unknown as HTMLElement);

    accessibleRouteChangeHandler();
    jest.runAllTimers();

    expect(mainContainer.focus).toHaveBeenCalled();
  });

  it('findPath(): should find the path from a deeply nested object, given a value', () => {
    expect(findPath(nestedBranch, 'set-body-877932', 'UUID')).toEqual([
      '2',
      'branches',
      '0',
      'steps',
      '1',
      'branches',
      '0',
      'steps',
      '0',
    ]);
  });

  it('should allow consumers to format Dates using formatDateTime()', () => {
    const spy = jest.spyOn(Intl, 'DateTimeFormat');

    formatDateTime('1971-03-15T00:00:00.000Z');

    expect(spy).toHaveBeenCalledWith('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'long',
    });
  });

  describe('getDeepValue()', () => {
    it('getDeepValue(): return undefined for an empty path', () => {
      expect(getDeepValue({ foo: 'bar' }, '')).toBeUndefined();
    });

    it('getDeepValue(): given a complex object & path, should return the value of the object at the path', () => {
      const object = { a: [{ bar: { c: 3 }, baz: { d: 2 } }] };
      expect(getDeepValue(object, 'a[0].baz.d')).toEqual(2);

      const objectArray = [object];
      expect(getDeepValue(objectArray, '[0].a[0].bar.c')).toEqual(3);
    });

    it('getDeepValue(): given a complex object & path, should return the value of the object using a path array', () => {
      const object = { a: [{ bar: { c: 3 }, baz: { d: 2 } }] };
      expect(getDeepValue(object, ['a', '0', 'baz', 'd'])).toEqual(2);

      const objectArray = [object];
      expect(getDeepValue(objectArray, ['0', 'a', '0', 'bar', 'c'])).toEqual(3);
    });
  });

  /**
   * setDeepValue
   */
  it('setDeepValue(): given a path, should modify only a deeply nested value within a complex object', () => {
    const object = { a: [{ bar: { c: 3 }, baz: { d: 2 } }] };

    expect(setDeepValue(object, 'a[0].bar.c', 4)).toEqual({
      a: [{ bar: { c: 4 }, baz: { d: 2 } }],
    });

    expect(setDeepValue(object, ['x', '0', 'y', 'z'], 5)).toEqual({
      a: [{ bar: { c: 4 }, baz: { d: 2 } }],
      x: { '0': { y: { z: 5 } } },
    });

    const objectArray = [object];
    expect(setDeepValue(objectArray, '[0].a[0].bar.c', 6)).toEqual([
      { a: [{ bar: { c: 6 }, baz: { d: 2 } }], x: { '0': { y: { z: 5 } } } },
    ]);
  });

  describe('shortenString()', () => {
    it('should return undefined for an empty string', () => {
      expect(shorten('', 10)).toBeUndefined();
    });

    it('should return the string if it is shorter than the max length', () => {
      expect(shorten('foo', 10)).toEqual('foo');
    });

    it('should return the string if it is equal to the max length', () => {
      expect(shorten('foo', 3)).toEqual('foo');
    });

    it('should return the portion of the string up to the max length', () => {
      expect(shorten('foobar', 3, '')).toEqual('foo..');
    });

    it('should return the portion of the string up to the max length without truncating a word', () => {
      expect(shorten('the lazy old fox', 5, ' ')).toEqual('the..');
    });
  });

  describe('truncateString()', () => {
    it('should the portion of the string up to the max length', () => {
      expect(truncateString('foobar', 3)).toEqual('foo..');
    });

    it('should the the same string if it is smaller than the desired length', () => {
      expect(truncateString('foobar', 20)).toEqual('foobar');
    });
  });

  describe('getRandomArbitraryNumber()', () => {
    it('should return a random number', () => {
      expect(getRandomArbitraryNumber()).toEqual(expect.any(Number));
    });

    it('should return a random number using msCrypto if crypto module is not available', () => {
      Object.defineProperty(global, 'msCrypto', {
        value: global.crypto,
        writable: true,
      });

      jest
        .spyOn(global, 'crypto', 'get')
        .mockImplementationOnce(() => undefined as unknown as Crypto);

      expect(getRandomArbitraryNumber()).toEqual(expect.any(Number));
    });
  });

  describe('getDescriptionIfExists()', () => {
    it('should get description from Kamelets', () => {
      const kamelet = {
        metadata: {
          definition: {
            description: 'test',
          },
        },
      };
      expect(getDescriptionIfExists(kamelet as unknown as IIntegration)).toEqual('test');
    });

    it('should get description from Integration', () => {
      const integration = {
        description: 'test',
      };
      expect(getDescriptionIfExists(integration as unknown as IIntegration)).toEqual('test');
    });

    it('should get description from metadata', () => {
      const integration = {
        metadata: {
          description: 'test',
        },
      };
      expect(getDescriptionIfExists(integration as unknown as IIntegration)).toEqual('test');
    });

    it('should return undefined if metadata does not contain description', () => {
      const integration = {};
      expect(getDescriptionIfExists(integration as unknown as IIntegration)).toBeUndefined();
    });

    it('should return undefined for an undefined integrationJson', () => {
      expect(getDescriptionIfExists(undefined as unknown as IIntegration)).toBeUndefined();
    });
  });
});
