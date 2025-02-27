jest.mock('node:child_process', (): {} => ({}));
globalThis.addEventListener = jest.fn();

import { computingTime } from './cut.worker';

describe('test computingTime utils', function(): void {
  test('should return right diff time - 1', function(): void {
    expect(computingTime([0, 0, 0], [0, 0, 3])).toEqual([0, 0, 3]);
  });

  test('should return right diff time - 2', function(): void {
    expect(computingTime([0, 1, 52], [0, 2, 13])).toEqual([0, 0, 21]);
  });

  test('should return right diff time - 3', function(): void {
    expect(computingTime([0, 8, 26], [0, 10, 12])).toEqual([0, 1, 46]);
  });

  test('should return right diff time - 4', function(): void {
    expect(computingTime([5, 32, 14], [8, 16, 5])).toEqual([2, 43, 51]);
  });
});