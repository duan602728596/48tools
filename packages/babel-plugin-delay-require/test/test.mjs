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

  deepStrictEqual(result.code.match(/__ELECTRON__DELAY_REQUIRE__a \?{2}=/g).length, 1);
  deepStrictEqual(/let __ELECTRON__DELAY_REQUIRE__a;(.|\n)+test\s*\(\)/.test(result.code), true);
  deepStrictEqual(/test\s*\(\)(.|\n)+__ELECTRON__DELAY_REQUIRE__a \?{2}=(.|\n)+test1\s*\(\)/.test(result.code), true);
});

// if作用域
test('if scope', async function() {
  const code = `import * as b from 'b';

function test() {
  if (b()) {}
}`;
  const result = await transform(code);

  deepStrictEqual(result.code.match(/__ELECTRON__DELAY_REQUIRE__b \?{2}=/g).length, 1);
  deepStrictEqual(/test\s*\(\)(.|\n)+__ELECTRON__DELAY_REQUIRE__b \?{2}=(.|\n)+if/.test(result.code), true);
});

// 顺序的不同
test('different order', async function() {
  const code = `import { c1 } from 'c';

function test() {
  if (c1) {}

  c1();
}`;
  const result = await transform(code);

  deepStrictEqual(result.code.match(/__ELECTRON__DELAY_REQUIRE__c \?{2}=/g).length, 1);
  deepStrictEqual(/test\s*\(\)(.|\n)+__ELECTRON__DELAY_REQUIRE__c \?{2}=(.|\n)+if/.test(result.code), true);
});

// class作用域
test('class scope', async function() {
  const code = `import a from 'a';

class Test {
  v = a.b();
  m = a.c();
}`;
  const result = await transform(code);

  deepStrictEqual(result.code.match(/__ELECTRON__DELAY_REQUIRE__a \?{2}=/g).length, 1);
  deepStrictEqual(/static\s*\{(.|\n)+__ELECTRON__DELAY_REQUIRE__a \?{2}=(.|\n)+}/.test(result.code), true);
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

  deepStrictEqual(result.code.match(/__ELECTRON__DELAY_REQUIRE__b \?{2}=/g).length, 1);
  deepStrictEqual(/test\s*\(\)(.|\n)+__ELECTRON__DELAY_REQUIRE__b \?{2}=(.|\n)+switch/.test(result.code), true);
});

// 箭头函数
test('arrow function', async function() {
  const code = `import { c2 } from 'c';

function test(m) {
  const v = m.some((o) => o === c2);
}`;
  const result = await transform(code);

  deepStrictEqual(result.code.match(/__ELECTRON__DELAY_REQUIRE__c \?{2}=/g).length, 1);
  deepStrictEqual(/test\s*\(m\)(.|\n)+__ELECTRON__DELAY_REQUIRE__c \?{2}=(.|\n)+const v/.test(result.code), true);
});

if (args[0] === 'debug') {
  await setTimeoutPromise(60_000_000);
}

// 多个同名的包
test('multiple same name packages(1)', async function() {
  const code = `import * as b from 'b';
import { e, f, g } from 'b';

console.log(b);
console.log(e());
console.log(f());
console.log(g());`;
  const result = await transform(code);

  deepStrictEqual(result.code.match(/__ELECTRON__DELAY_REQUIRE__b \?{2}=/g).length, 1);
  deepStrictEqual(/\(__ELECTRON__DELAY_REQUIRE__b\)/.test(result.code), true);
  deepStrictEqual(/\(__ELECTRON__DELAY_REQUIRE__b.e\(\)\)/.test(result.code), true);
  deepStrictEqual(/\(__ELECTRON__DELAY_REQUIRE__b.f\(\)\)/.test(result.code), true);
  deepStrictEqual(/\(__ELECTRON__DELAY_REQUIRE__b.g\(\)\)/.test(result.code), true);
});

test('multiple same name packages(2)', async function() {
  const code = `import b from 'b';
import { e, f, g } from 'b';

console.log(b);
console.log(e());
console.log(f());
console.log(g());`;
  const result = await transform(code);

  deepStrictEqual(result.code.match(/__ELECTRON__DELAY_REQUIRE__b \?{2}=/g).length, 1);
  deepStrictEqual(/\(__ELECTRON__DELAY_REQUIRE__b\.default\)/.test(result.code), true);
  deepStrictEqual(/\(__ELECTRON__DELAY_REQUIRE__b.e\(\)\)/.test(result.code), true);
  deepStrictEqual(/\(__ELECTRON__DELAY_REQUIRE__b.f\(\)\)/.test(result.code), true);
  deepStrictEqual(/\(__ELECTRON__DELAY_REQUIRE__b.g\(\)\)/.test(result.code), true);
});

// 使用requestIdleCallback在空闲时间加载模块
test('use requestIdleCallback for require modules', async function() {
  const code = `import a from 'a';
import b from 'b';
import c from 'c';

a();
b();
c();`;
  const result = await transform(code, true);

  deepStrictEqual(result.code.match(/__ELECTRON__DELAY_REQUIRE__a \?{2}=/g).length, 2);
  deepStrictEqual(
    /requestIdleCallback\(\(\) => __ELECTRON__DELAY_REQUIRE__a \?{2}= globalThis\.require\(["']a["']\)\)/g.test(result.code),
    true
  );
  deepStrictEqual(result.code.match(/__ELECTRON__DELAY_REQUIRE__b \?{2}=/g).length, 2);
  deepStrictEqual(
    /requestIdleCallback\(\(\) => __ELECTRON__DELAY_REQUIRE__b \?{2}= globalThis\.require\(["']b["']\)\)/g.test(result.code),
    true
  );
  deepStrictEqual(result.code.match(/__ELECTRON__DELAY_REQUIRE__c \?{2}=/g).length, 2);
  deepStrictEqual(
    /requestIdleCallback\(\(\) => __ELECTRON__DELAY_REQUIRE__c \?{2}= globalThis\.require\(["']c["']\)\)/g.test(result.code),
    true
  );
});