import nestedBranch from '../store/data/kamelet.nested-branch.steps';
import {
  accessibleRouteChangeHandler,
  bindUndoRedo,
  findPath,
  formatDateTime,
  getDeepValue,
  getDescriptionIfExists,
  getRandomArbitraryNumber,
  setDeepValue,
  shorten,
  sleep,
  truncateString,
  unbindUndoRedo,
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

  describe('bindUndoRedo()', () => {
    it('should bind "undo" and "redo" callbacks to a keyboard event', () => {
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener');

      const callback = bindUndoRedo(jest.fn(), jest.fn());

      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      document.removeEventListener('keydown', callback);
    });

    it('should call "redo" function when pressing CTRL + SHIFT + Z', () => {
      const redoSpy = jest.fn();

      const callback = bindUndoRedo(jest.fn(), redoSpy);

      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          ctrlKey: true,
          shiftKey: true,
          key: 'Z',
        }),
      );

      expect(redoSpy).toHaveBeenCalled();
      document.removeEventListener('keydown', callback);
    });

    it('should call "redo" function when pressing CTRL + y', () => {
      const redoSpy = jest.fn();

      const callback = bindUndoRedo(jest.fn(), redoSpy);

      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          ctrlKey: true,
          shiftKey: false,
          key: 'y',
        }),
      );

      expect(redoSpy).toHaveBeenCalled();
      document.removeEventListener('keydown', callback);
    });

    it('should call "undo" function when pressing CTRL + z', () => {
      const undoSpy = jest.fn();

      const callback = bindUndoRedo(undoSpy, jest.fn());

      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          ctrlKey: true,
          shiftKey: false,
          key: 'z',
        }),
      );

      expect(undoSpy).toHaveBeenCalled();
      document.removeEventListener('keydown', callback);
    });
  });

  it('bindUndoRedo should unbind a keydown event callback', () => {
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

    const callback = jest.fn();
    document.addEventListener('keydown', callback);
    unbindUndoRedo(callback);

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', callback);
  });

  it('sleep should return a promise that resolves after a given time', async () => {
    const start = Date.now();
    const sleepPromise = sleep(100_000).then(() => Date.now() - start);
    jest.runAllTimers();

    await expect(sleepPromise).resolves.toEqual(100_000);
  });

  describe('getRandomArbitraryNumber()', () => {
    it('should return a random number', () => {
      expect(getRandomArbitraryNumber()).toEqual(expect.any(Number));
    });

    it('should return a random number using Date.now() if crypto module is not available', () => {
      jest
        .spyOn(global, 'crypto', 'get')
        .mockImplementationOnce(() => undefined as unknown as Crypto);
      jest.spyOn(global.Date, 'now').mockReturnValueOnce(888);

      const result = getRandomArbitraryNumber();

      expect(result).toEqual(888);
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
