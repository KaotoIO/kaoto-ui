import nestedBranch from '../store/data/kamelet.nested-branch.steps';
import { findPath, pathToString, setDeepValue } from './index';

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

  it('pathToString(): should convert a path array into a string', () => {
    const path = ['a', 'b', 'c', 'defg', 0, '1', 2.3, -55, '-66', undefined];

    expect(pathToString(path)).toEqual('a.b.c.defg[0][1]["2.3"]["-55"]["-66"]["undefined"]');

    expect(pathToString(path, 'prefix', '[0]')).toEqual(
      'prefix[0].a.b.c.defg[0][1]["2.3"]["-55"]["-66"]["undefined"]'
    );
  });

  it('setDeepValue(): given a path, should modify only a deeply nested value within a complex object', () => {
    const object = { a: [{ bar: { c: 3 } }] };
    expect(setDeepValue(object, 'a[0].bar.c', 4)).toEqual(4);
    expect(setDeepValue(object, ['x', '0', 'y', 'z'], 5)).toEqual(5);
  });
});
