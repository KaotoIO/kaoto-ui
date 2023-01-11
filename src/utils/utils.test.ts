import nestedBranch from '../store/data/kamelet.nested-branch.steps';
import { findPath, setDeepValue } from './index';

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
});
