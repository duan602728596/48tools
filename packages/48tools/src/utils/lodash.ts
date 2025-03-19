/**
 * omit函数的实现
 * @param { T extends object } obj - object
 * @param { Array<K extends keyof T> } delKeys - 从object中删除的keys
 */
export function omit<T extends object, K extends keyof T>(obj: T, delKeys: Array<K>): Omit<T, K> {
  return Object.entries(obj).reduce(function(result: Omit<T, K>, [key, value]: [string, any]): Omit<T, K> {
    if (!delKeys.includes(key as K)) {
      result[key] = value;
    }

    return result;
  }, {} as Omit<T, K>);
}

/**
 * pick函数的实现
 * @param { T extends object } obj - object
 * @param { Array<K extends keyof T> } useKeys - object保留的keys
 */
export function pick<T extends object, K extends keyof T>(obj: T, useKeys: Array<K>): Pick<T, K> {
  return Object.entries(obj).reduce(function(result: Pick<T, K>, [key, value]: [string, any]): Pick<T, K> {
    if (useKeys.includes(key as K)) {
      result[key] = value;
    }

    return result;
  }, {} as Pick<T, K>);
}