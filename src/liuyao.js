import { BRANCHES } from './calendar.js';

export const LINE_TYPES = {
  6: { name: '老阴', yang: false, moving: true, mark: '×', changedYang: true },
  7: { name: '少阳', yang: true, moving: false, mark: '', changedYang: true },
  8: { name: '少阴', yang: false, moving: false, mark: '', changedYang: false },
  9: { name: '老阳', yang: true, moving: true, mark: '○', changedYang: false },
};

export const LINE_POSITION_NAMES = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];

const ELEMENT_BY_BRANCH = {
  子: '水', 丑: '土', 寅: '木', 卯: '木', 辰: '土', 巳: '火',
  午: '火', 未: '土', 申: '金', 酉: '金', 戌: '土', 亥: '水',
};

const GENERATES = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' };
const CONTROLS = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' };

const TRIGRAMS = {
  乾: {
    bits: 7, element: '金',
    inner: { stem: '甲', branches: ['子', '寅', '辰'] },
    outer: { stem: '壬', branches: ['午', '申', '戌'] },
  },
  兑: {
    bits: 3, element: '金',
    inner: { stem: '丁', branches: ['巳', '卯', '丑'] },
    outer: { stem: '丁', branches: ['亥', '酉', '未'] },
  },
  离: {
    bits: 5, element: '火',
    inner: { stem: '己', branches: ['卯', '丑', '亥'] },
    outer: { stem: '己', branches: ['酉', '未', '巳'] },
  },
  震: {
    bits: 1, element: '木',
    inner: { stem: '庚', branches: ['子', '寅', '辰'] },
    outer: { stem: '庚', branches: ['午', '申', '戌'] },
  },
  巽: {
    bits: 6, element: '木',
    inner: { stem: '辛', branches: ['丑', '亥', '酉'] },
    outer: { stem: '辛', branches: ['未', '巳', '卯'] },
  },
  坎: {
    bits: 2, element: '水',
    inner: { stem: '戊', branches: ['寅', '辰', '午'] },
    outer: { stem: '戊', branches: ['申', '戌', '子'] },
  },
  艮: {
    bits: 4, element: '土',
    inner: { stem: '丙', branches: ['辰', '午', '申'] },
    outer: { stem: '丙', branches: ['戌', '子', '寅'] },
  },
  坤: {
    bits: 0, element: '土',
    inner: { stem: '乙', branches: ['未', '巳', '卯'] },
    outer: { stem: '癸', branches: ['丑', '亥', '酉'] },
  },
};

const TRIGRAM_BY_BITS = Object.fromEntries(
  Object.entries(TRIGRAMS).map(([name, data]) => [data.bits, { name, ...data }]),
);

const HEXAGRAM_NAMES = {
  乾乾: '乾为天', 乾兑: '天泽履', 乾离: '天火同人', 乾震: '天雷无妄', 乾巽: '天风姤', 乾坎: '天水讼', 乾艮: '天山遁', 乾坤: '天地否',
  兑乾: '泽天夬', 兑兑: '兑为泽', 兑离: '泽火革', 兑震: '泽雷随', 兑巽: '泽风大过', 兑坎: '泽水困', 兑艮: '泽山咸', 兑坤: '泽地萃',
  离乾: '火天大有', 离兑: '火泽睽', 离离: '离为火', 离震: '火雷噬嗑', 离巽: '火风鼎', 离坎: '火水未济', 离艮: '火山旅', 离坤: '火地晋',
  震乾: '雷天大壮', 震兑: '雷泽归妹', 震离: '雷火丰', 震震: '震为雷', 震巽: '雷风恒', 震坎: '雷水解', 震艮: '雷山小过', 震坤: '雷地豫',
  巽乾: '风天小畜', 巽兑: '风泽中孚', 巽离: '风火家人', 巽震: '风雷益', 巽巽: '巽为风', 巽坎: '风水涣', 巽艮: '风山渐', 巽坤: '风地观',
  坎乾: '水天需', 坎兑: '水泽节', 坎离: '水火既济', 坎震: '水雷屯', 坎巽: '水风井', 坎坎: '坎为水', 坎艮: '水山蹇', 坎坤: '水地比',
  艮乾: '山天大畜', 艮兑: '山泽损', 艮离: '山火贲', 艮震: '山雷颐', 艮巽: '山风蛊', 艮坎: '山水蒙', 艮艮: '艮为山', 艮坤: '山地剥',
  坤乾: '地天泰', 坤兑: '地泽临', 坤离: '地火明夷', 坤震: '地雷复', 坤巽: '地风升', 坤坎: '地水师', 坤艮: '地山谦', 坤坤: '坤为地',
};

const PALACE_STAGES = [
  { name: '本宫', detail: '六世', mask: 0, shi: 6 },
  { name: '一世', detail: '一世', mask: 1, shi: 1 },
  { name: '二世', detail: '二世', mask: 3, shi: 2 },
  { name: '三世', detail: '三世', mask: 7, shi: 3 },
  { name: '四世', detail: '四世', mask: 15, shi: 4 },
  { name: '五世', detail: '五世', mask: 31, shi: 5 },
  { name: '游魂', detail: '游魂', mask: 23, shi: 4 },
  { name: '归魂', detail: '归魂', mask: 16, shi: 3 },
];

const SIX_GODS_BY_DAY_STEM = {
  甲: ['青龙', '朱雀', '勾陈', '螣蛇', '白虎', '玄武'],
  乙: ['青龙', '朱雀', '勾陈', '螣蛇', '白虎', '玄武'],
  丙: ['朱雀', '勾陈', '螣蛇', '白虎', '玄武', '青龙'],
  丁: ['朱雀', '勾陈', '螣蛇', '白虎', '玄武', '青龙'],
  戊: ['勾陈', '螣蛇', '白虎', '玄武', '青龙', '朱雀'],
  己: ['螣蛇', '白虎', '玄武', '青龙', '朱雀', '勾陈'],
  庚: ['白虎', '玄武', '青龙', '朱雀', '勾陈', '螣蛇'],
  辛: ['白虎', '玄武', '青龙', '朱雀', '勾陈', '螣蛇'],
  壬: ['玄武', '青龙', '朱雀', '勾陈', '螣蛇', '白虎'],
  癸: ['玄武', '青龙', '朱雀', '勾陈', '螣蛇', '白虎'],
};

const COMBINE_BRANCH = {
  子: '丑', 丑: '子', 寅: '亥', 亥: '寅', 卯: '戌', 戌: '卯',
  辰: '酉', 酉: '辰', 巳: '申', 申: '巳', 午: '未', 未: '午',
};

const ADVANCE_BRANCH = {
  亥: '子', 寅: '卯', 巳: '午', 申: '酉',
  丑: '辰', 辰: '未', 未: '戌', 戌: '丑',
};

const GRAVE_BRANCH = { 木: '未', 火: '戌', 土: '辰', 金: '丑', 水: '辰' };
const EXTINCT_BRANCH = { 木: '申', 火: '亥', 土: '巳', 金: '寅', 水: '巳' };

function bitsKey(bits) {
  return bits.map((bit) => (bit ? '1' : '0')).join('');
}

function trigramFromBits(bits, offset = 0) {
  const value = Number(bits[offset]) + Number(bits[offset + 1]) * 2 + Number(bits[offset + 2]) * 4;
  return TRIGRAM_BY_BITS[value];
}

function pureBitsForTrigram(trigram) {
  const bits = [0, 1, 2].map((index) => Boolean(trigram.bits & (1 << index)));
  return [...bits, ...bits];
}

const PALACE_LOOKUP = (() => {
  const lookup = new Map();
  for (const [palaceName, trigram] of Object.entries(TRIGRAMS)) {
    const base = pureBitsForTrigram(trigram);
    for (const stage of PALACE_STAGES) {
      const bits = base.map((bit, index) => (stage.mask & (1 << index) ? !bit : bit));
      lookup.set(bitsKey(bits), {
        palaceName,
        palaceElement: trigram.element,
        stageName: stage.name,
        stageDetail: stage.detail,
        shi: stage.shi,
        ying: ((stage.shi + 2) % 6) + 1,
      });
    }
  }
  return lookup;
})();

function sixRelation(palaceElement, lineElement) {
  if (palaceElement === lineElement) return '兄弟';
  if (GENERATES[palaceElement] === lineElement) return '子孙';
  if (GENERATES[lineElement] === palaceElement) return '父母';
  if (CONTROLS[palaceElement] === lineElement) return '妻财';
  return '官鬼';
}

function getNaJia(bits, palaceElement) {
  const lower = trigramFromBits(bits, 0);
  const upper = trigramFromBits(bits, 3);
  return bits.map((yang, index) => {
    const group = index < 3 ? lower.inner : upper.outer;
    const groupIndex = index % 3;
    const branch = group.branches[groupIndex];
    const element = ELEMENT_BY_BRANCH[branch];
    return {
      line: index + 1,
      yang,
      stem: group.stem,
      branch,
      element,
      stemBranch: `${group.stem}${branch}`,
      relation: sixRelation(palaceElement, element),
    };
  });
}

function getHexagram(bits) {
  const lower = trigramFromBits(bits, 0);
  const upper = trigramFromBits(bits, 3);
  const palace = PALACE_LOOKUP.get(bitsKey(bits));
  if (!palace) throw new Error('无法确定卦宫');
  return {
    name: HEXAGRAM_NAMES[`${upper.name}${lower.name}`],
    upper,
    lower,
    ...palace,
  };
}

function isClash(a, b) {
  const aIndex = BRANCHES.indexOf(a);
  const bIndex = BRANCHES.indexOf(b);
  return aIndex >= 0 && bIndex >= 0 && (aIndex + 6) % 12 === bIndex;
}

function isCombine(a, b) {
  return COMBINE_BRANCH[a] === b;
}

function objectiveTags(branch, calendar) {
  const tags = [];
  if (calendar.voidBranches.includes(branch)) tags.push('空');
  if (isClash(branch, calendar.monthBranch)) tags.push('月破');
  if (isClash(branch, calendar.dayBranch)) tags.push('日冲');
  if (isCombine(branch, calendar.monthBranch)) tags.push('月合');
  if (isCombine(branch, calendar.dayBranch)) tags.push('日合');
  return tags;
}

function changeTags(original, changed, calendar) {
  const tags = [];
  if (GENERATES[changed.element] === original.element) tags.push('回头生');
  if (CONTROLS[changed.element] === original.element) tags.push('回头克');
  if (ADVANCE_BRANCH[original.branch] === changed.branch) tags.push('化进');
  if (ADVANCE_BRANCH[changed.branch] === original.branch) tags.push('化退');
  if (calendar.voidBranches.includes(changed.branch)) tags.push('化空');
  if (isClash(changed.branch, calendar.monthBranch)) tags.push('化破');
  if (GRAVE_BRANCH[original.element] === changed.branch) tags.push('化墓');
  if (EXTINCT_BRANCH[original.element] === changed.branch) tags.push('化绝');
  if (original.branch === changed.branch) tags.push('化伏吟');
  if (isClash(original.branch, changed.branch)) tags.push('化反吟');
  return [...new Set(tags)];
}

function getHiddenSpirits(originalNaJia, palaceName, palaceElement) {
  const presentRelations = new Set(originalNaJia.map((line) => line.relation));
  const pureNaJia = getNaJia(pureBitsForTrigram(TRIGRAMS[palaceName]), palaceElement);
  return pureNaJia.map((line) => (
    presentRelations.has(line.relation)
      ? null
      : { relation: line.relation, stemBranch: line.stemBranch, element: line.element }
  ));
}

function getGuaBody(bits, shi) {
  const isYang = bits[shi - 1];
  const startIndex = isYang ? 0 : 6;
  return BRANCHES[(startIndex + shi - 1) % 12];
}

function structuralTags(naJia, hexagram) {
  const tags = [];
  if ([0, 1, 2].every((index) => isCombine(naJia[index].branch, naJia[index + 3].branch))) tags.push('六合');
  if ([0, 1, 2].every((index) => isClash(naJia[index].branch, naJia[index + 3].branch))) tags.push('六冲');
  if (hexagram.stageName === '游魂') tags.push('游魂');
  if (hexagram.stageName === '归魂') tags.push('归魂');
  return tags;
}

function changedPatternTags(originalNaJia, changedNaJia, values) {
  const tags = [];
  const halves = [
    { indexes: [0, 1, 2], name: '内卦' },
    { indexes: [3, 4, 5], name: '外卦' },
  ];
  for (const half of halves) {
    const hasMove = half.indexes.some((index) => LINE_TYPES[values[index]].moving);
    if (!hasMove) continue;
    if (half.indexes.every((index) => originalNaJia[index].branch === changedNaJia[index].branch)) {
      tags.push(`${half.name}伏吟`);
    }
    if (half.indexes.every((index) => isClash(originalNaJia[index].branch, changedNaJia[index].branch))) {
      tags.push(`${half.name}反吟`);
    }
  }
  if (tags.includes('内卦伏吟') && tags.includes('外卦伏吟')) tags.push('全卦伏吟');
  if (tags.includes('内卦反吟') && tags.includes('外卦反吟')) tags.push('全卦反吟');
  return tags;
}

export function coinFacesToValue(faces) {
  if (!Array.isArray(faces) || faces.length !== 3 || faces.some((face) => !['front', 'back'].includes(face))) {
    throw new Error('每一爻必须包含三枚乾隆通宝的字面或背面');
  }
  return 6 + faces.filter((face) => face === 'back').length;
}

export function lineSymbol(value) {
  const type = LINE_TYPES[value];
  return `${type.yang ? '━━━━━' : '━━　━━'}${type.mark ? ` ${type.mark}` : ''}`;
}

export function changedLineSymbol(value) {
  return LINE_TYPES[value].changedYang ? '━━━━━' : '━━　━━';
}

export function buildChart({ values, calendar, question = '' }) {
  if (!Array.isArray(values) || values.length !== 6 || values.some((value) => !LINE_TYPES[value])) {
    throw new Error('必须按初爻至上爻提供六个有效爻值');
  }
  const originalBits = values.map((value) => LINE_TYPES[value].yang);
  const changedBits = values.map((value) => LINE_TYPES[value].changedYang);
  const original = getHexagram(originalBits);
  const changed = getHexagram(changedBits);
  const originalNaJia = getNaJia(originalBits, original.palaceElement);
  const changedNaJia = getNaJia(changedBits, original.palaceElement);
  const changedOwnPalaceNaJia = getNaJia(changedBits, changed.palaceElement);
  const hidden = getHiddenSpirits(originalNaJia, original.palaceName, original.palaceElement);
  const sixGods = SIX_GODS_BY_DAY_STEM[calendar.dayStem];
  const hasMoving = values.some((value) => LINE_TYPES[value].moving);

  const lines = values.map((value, index) => {
    const originalLine = originalNaJia[index];
    const changedLine = changedNaJia[index];
    const moving = LINE_TYPES[value].moving;
    return {
      position: index + 1,
      positionName: LINE_POSITION_NAMES[index],
      value,
      type: LINE_TYPES[value].name,
      moving,
      mark: LINE_TYPES[value].mark,
      god: sixGods[index],
      hidden: hidden[index],
      original: {
        ...originalLine,
        tags: objectiveTags(originalLine.branch, calendar),
        shiYing: original.shi === index + 1 ? '世' : original.ying === index + 1 ? '应' : '',
      },
      changed: {
        ...changedLine,
        ownPalaceRelation: changedOwnPalaceNaJia[index].relation,
        tags: moving ? changeTags(originalLine, changedLine, calendar) : [],
        shiYing: changed.shi === index + 1 ? '世' : changed.ying === index + 1 ? '应' : '',
      },
    };
  });

  const originalTags = structuralTags(originalNaJia, original);
  const changedTags = hasMoving ? structuralTags(changedNaJia, changed) : [];
  const patternTags = hasMoving ? changedPatternTags(originalNaJia, changedNaJia, values) : [];
  const transitionTags = [];
  if (originalTags.includes('六冲') && changedTags.includes('六合')) transitionTags.push('六冲变六合');
  if (originalTags.includes('六合') && changedTags.includes('六冲')) transitionTags.push('六合变六冲');

  const originalGuaBody = getGuaBody(originalBits, original.shi);
  const changedGuaBody = getGuaBody(changedBits, changed.shi);

  return {
    question: question.trim(),
    calendar,
    values: [...values],
    hasMoving,
    original: { ...original, tags: originalTags, guaBody: originalGuaBody },
    changed: { ...changed, tags: changedTags, guaBody: changedGuaBody },
    guaBody: originalGuaBody,
    lines,
    patternTags: [...patternTags, ...transitionTags],
  };
}
