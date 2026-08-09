import test from 'node:test';
import assert from 'node:assert/strict';

import lunarPkg from 'lunar-javascript';

globalThis.Solar = lunarPkg.Solar;

const { getCalendarInfo } = await import('../src/calendar.js');

test('节气月柱与23点换日', () => {
  const beforeZi = getCalendarInfo({ year: 2026, month: 8, day: 9, hour: 22, minute: 0 }, '23');
  assert.equal(beforeZi.year, '丙午');
  assert.equal(beforeZi.month, '丙申');
  assert.equal(beforeZi.day, '乙卯');
  assert.equal(beforeZi.time, '丁亥');
  assert.equal(beforeZi.voidText, '子丑');

  const afterZi = getCalendarInfo({ year: 2026, month: 8, day: 9, hour: 23, minute: 0 }, '23');
  assert.equal(afterZi.day, '丙辰');
  assert.equal(afterZi.time, '戊子');
});

test('0点换日时23点仍沿用当天日柱', () => {
  const info = getCalendarInfo({ year: 2026, month: 8, day: 9, hour: 23, minute: 0 }, '0');
  assert.equal(info.day, '乙卯');
  assert.equal(info.time, '丙子');
});
