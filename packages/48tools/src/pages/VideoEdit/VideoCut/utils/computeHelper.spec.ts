jest.mock('node:child_process', (): {} => ({}));
jest.mock('../../../../utils/utils', (): {} => ({}));

import { getFullTime } from './computeHelper';

describe('test getFullTime utils', function(): void {
  test('should return time', function(): void {
    expect(getFullTime(1, '5', '16')).toBe('01:05:16');
  });

  test('should return time pass number', function(): void {
    expect(getFullTime(0, 1, 3)).toBe('00:01:03');
  });

  test('should return time pass string', function(): void {
    expect(getFullTime('1', '4', '13')).toBe('01:04:13');
  });

  test('should return time pass undefined', function(): void {
    expect(getFullTime('12', undefined, undefined)).toBe('12:00:00');
  });

  test('should return time pass not number str string', function(): void {
    expect(getFullTime('12', 'a', 'b')).toBe('12:00:00');
  });

  test('should return undefined pass all undefined', function(): void {
    expect(getFullTime(undefined, undefined, undefined)).toBe(undefined);
  });
});