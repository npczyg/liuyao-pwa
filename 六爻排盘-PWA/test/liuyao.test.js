import test from 'node:test';
import assert from 'node:assert/strict';

import { buildChart, coinFacesToValue } from '../src/liuyao.js';

const calendar = {
  dayStem: '己',
  dayBranch: '亥',
  monthBranch: '戌',
  voidBranches: ['辰', '巳'],
};

test('三枚乾隆通宝按背面数量换算四象', () => {
  assert.equal(coinFacesToValue(['front', 'front', 'front']), 6);
  assert.equal(coinFacesToValue(['back', 'front', 'front']), 7);
  assert.equal(coinFacesToValue(['back', 'back', 'front']), 8);
  assert.equal(coinFacesToValue(['back', 'back', 'back']), 9);
});

test('截图示例排为火泽睽之天雷无妄', () => {
  const chart = buildChart({
    values: [7, 9, 8, 7, 6, 7],
    calendar,
    question: '示例',
  });

  assert.equal(chart.original.name, '火泽睽');
  assert.equal(chart.original.palaceName, '艮');
  assert.equal(chart.original.stageName, '四世');
  assert.equal(chart.original.shi, 4);
  assert.equal(chart.original.ying, 1);
  assert.equal(chart.changed.name, '天雷无妄');
  assert.equal(chart.original.guaBody, '卯');
  assert.equal(chart.changed.guaBody, '卯');
  assert.deepEqual(chart.lines.map((line) => line.god), ['螣蛇', '白虎', '玄武', '青龙', '朱雀', '勾陈']);
  assert.deepEqual(chart.lines.map((line) => line.original.stemBranch), ['丁巳', '丁卯', '丁丑', '己酉', '己未', '己巳']);
  assert.deepEqual(chart.lines.map((line) => line.changed.stemBranch), ['庚子', '庚寅', '庚辰', '壬午', '壬申', '壬戌']);
});

test('本卦与变卦分别依各自世爻阴阳计算卦身', () => {
  const chart = buildChart({ values: [9, 7, 7, 7, 7, 7], calendar });
  assert.equal(chart.original.name, '乾为天');
  assert.equal(chart.original.guaBody, '巳');
  assert.equal(chart.changed.name, '天风姤');
  assert.equal(chart.changed.guaBody, '午');
});

test('乾为天属于乾宫本宫，世上应三', () => {
  const chart = buildChart({ values: [7, 7, 7, 7, 7, 7], calendar });
  assert.equal(chart.original.name, '乾为天');
  assert.equal(chart.original.palaceName, '乾');
  assert.equal(chart.original.stageName, '本宫');
  assert.equal(chart.original.shi, 6);
  assert.equal(chart.original.ying, 3);
  assert.ok(chart.original.tags.includes('六冲'));
  assert.equal(chart.hasMoving, false);
});

test('all 4096 moving-line combinations produce complete charts', () => {
  for (let encoded = 0; encoded < 4096; encoded += 1) {
    const values = Array.from({ length: 6 }, (_, index) => 6 + ((encoded >> (index * 2)) & 3));
    const chart = buildChart({ values, calendar });
    assert.ok(chart.original.name);
    assert.ok(chart.changed.name);
    assert.equal(chart.lines.length, 6);
  }
});
