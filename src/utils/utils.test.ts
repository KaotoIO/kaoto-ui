import nestedBranch from '../store/data/kamelet.nested-branch.steps';
import {
  findPath,
  getDeepValue,
  getDescriptionIfExists,
  getRandomArbitraryNumber,
  setDeepValue,
} from './index';

describe('utils', () => {
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

  /**
   * getDeepValue
   */
  it('getDeepValue(): given a complex object & path, should return the value of the object at the path', () => {
    const object = { a: [{ bar: { c: 3 }, baz: { d: 2 } }] };
    expect(getDeepValue(object, 'a[0].baz.d')).toEqual(2);

    const objectArray = [object];
    expect(getDeepValue(objectArray, '[0].a[0].bar.c')).toEqual(3);
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

  it.skip('getRandomArbitraryNumber(): should get a random arbitrary number', () => {
    const mGetRandomValues = jest.fn().mockReturnValueOnce(new Uint32Array(10));

    Object.defineProperty(window, 'crypto', {
      value: { getRandomValues: mGetRandomValues },
    });

    expect(getRandomArbitraryNumber()).toEqual(new Uint32Array(10));
    expect(mGetRandomValues).toBeCalledWith(new Uint8Array(1));
  });

  it('test getDescription from different DSLs', () => {
    const kamelet = {
      metadata: {
        definition: {
          description: 'test',
        },
      },
    };
    const integration1 = {
      steps: [],
    };
    const integration2 = { ...integration1, description: 'test' };
    const integration3 = { ...integration1, metadata: { description: 'test' } };
    expect(getDescriptionIfExists(kamelet)).toEqual('test');
    expect(getDescriptionIfExists(integration1)).toEqual(undefined);
    expect(getDescriptionIfExists(integration2)).toEqual('test');
    expect(getDescriptionIfExists(integration3)).toEqual('test');
  });
});
