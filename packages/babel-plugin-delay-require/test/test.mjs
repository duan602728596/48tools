import test from 'node:test';
import { deepStrictEqual } from 'node:assert/strict';
import process from 'node:process';
import { setTimeout as setTimeoutPromise } from 'node:timers/promises';
import { transform } from './utils.mjs';

const args = process.argv.slice(2);

// 函数作用域
test('function scope', async function() {
  const code = `import a from 'a';

function test() {
  a.b();

  function test1() {
    a.c();
  }

  function test2() {
    a.d();

    function test3() {
      a.e();
    }
  }
}`;
  const result = await transform(code);

  deepStrictEqual(result.code.match(/__ELECTRON__DELAY_REQUIRE__a \?\?=/g).length, 1);
  deepStrictEqual(/let __ELECTRON__DELAY_REQUIRE__a \?\?=(.|\n)+test\s*\(\)/.test(result.code), true);
});

// if作用域
test('if scope', async function() {
  const code = `import * as b from 'b';

function test() {
  if (b.c()) {}
}`;
  const result = await transform(code);

  deepStrictEqual(result.code.match(/__ELECTRON__DELAY_REQUIRE__b \?\?=/g).length, 1);
  deepStrictEqual(/test\s*\(\)(.|\n)+__ELECTRON__DELAY_REQUIRE__b \?\?=(.|\n)+if/.test(result.code), true);
});

// 顺序的不同
test('different order', async function() {
  const code = `import { c1 } from 'c';

function test() {
  if (c1) {}

  c1();
}`;
  const result = await transform(code);

  deepStrictEqual(result.code.match(/__ELECTRON__DELAY_REQUIRE__c \?\?=/g).length, 1);
  deepStrictEqual(/test\s*\(\)(.|\n)+__ELECTRON__DELAY_REQUIRE__c \?\?=(.|\n)+if/.test(result.code), true);
});

// class作用域
test('class scope', async function() {
  const code = `import a from 'a';

class Test {
  v = a.b();
  m = a.c();
}`;
  const result = await transform(code);

  deepStrictEqual(result.code.match(/__ELECTRON__DELAY_REQUIRE__a \?\?=/g).length, 1);
  deepStrictEqual(/static\s*\{(.|\n)+__ELECTRON__DELAY_REQUIRE__a \?\?=(.|\n)+}/.test(result.code), true);
});

// switch作用域
test('switch scope', async function() {
  const code = `import * as b from 'b';

function test() {
  switch(b.d) {
    case 1:
      break;

    case 2:
      break;
  }
}`;
  const result = await transform(code);

  deepStrictEqual(result.code.match(/__ELECTRON__DELAY_REQUIRE__b \?\?=/g).length, 1);
  deepStrictEqual(/test\s*\(\)(.|\n)+__ELECTRON__DELAY_REQUIRE__b \?\?=(.|\n)+switch/.test(result.code), true);
});

// 箭头函数
test('arrow function', async function() {
  const code = `import { c2 } from 'c';

function test(m) {
  const v = m.some((o) => o === c2);
}`;
  const result = await transform(code);

  deepStrictEqual(result.code.match(/__ELECTRON__DELAY_REQUIRE__c \?\?=/g).length, 1);
  deepStrictEqual(/test\s*\(m\)(.|\n)+__ELECTRON__DELAY_REQUIRE__c \?\?=(.|\n)+const v/.test(result.code), true);
});

if (args[0] === 'debug') {
  await setTimeoutPromise(60_000_000);
}