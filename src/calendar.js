export const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
export const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

const DATE_PARTS_FORMATTER = new Intl.DateTimeFormat('zh-CN-u-nu-latn', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

function formatPartsToObject(parts) {
  const result = {};
  for (const part of parts) {
    if (part.type !== 'literal') result[part.type] = Number(part.value);
  }
  return result;
}

export function getShanghaiNowParts(date = new Date()) {
  return formatPartsToObject(DATE_PARTS_FORMATTER.formatToParts(date));
}

export function toDateTimeLocalValue(parts) {
  const pad = (value) => String(value).padStart(2, '0');
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}T${pad(parts.hour)}:${pad(parts.minute)}`;
}

export function parseDateTimeLocal(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value || '');
  if (!match) throw new Error('起卦时间格式不正确');
  const [, year, month, day, hour, minute] = match.map(Number);
  return { year, month, day, hour, minute, second: 0 };
}

function formatSolar(solar) {
  return solar.toYmdHms().slice(0, 16);
}

function timeStemFromDay(dayStem, timeBranch) {
  const dayIndex = STEMS.indexOf(dayStem);
  const timeIndex = BRANCHES.indexOf(timeBranch);
  return STEMS[((dayIndex % 5) * 2 + timeIndex) % 10];
}

export function getCalendarInfo(parts, rollover = '23') {
  const Solar = globalThis.Solar;
  if (!Solar) throw new Error('历法组件尚未加载，请重新打开应用');
  const solar = Solar.fromYmdHms(
    parts.year,
    parts.month,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second || 0,
  );
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();
  eightChar.setSect(rollover === '23' ? 1 : 2);

  const year = eightChar.getYear();
  const month = eightChar.getMonth();
  const day = eightChar.getDay();
  const dayStem = day[0];
  const dayBranch = day[1];
  const timeBranch = lunar.getTimeZhi();
  const timeStem = timeStemFromDay(dayStem, timeBranch);
  const time = `${timeStem}${timeBranch}`;
  const prevTerm = lunar.getPrevJieQi(false);
  const nextTerm = lunar.getNextJieQi(false);

  return {
    solarText: solar.toYmdHms(),
    displayTime: `${solar.toYmd()} ${String(parts.hour).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')}`,
    year,
    month,
    day,
    time,
    yearStem: year[0],
    yearBranch: year[1],
    monthStem: month[0],
    monthBranch: month[1],
    dayStem,
    dayBranch,
    timeStem,
    timeBranch,
    monthCommand: month[1],
    dayCommand: day[1],
    xun: eightChar.getDayXun(),
    voidBranches: [...eightChar.getDayXunKong()],
    voidText: eightChar.getDayXunKong(),
    rollover,
    rolloverText: rollover === '23' ? '23点换日' : '0点换日',
    prevTerm: {
      name: prevTerm.getName(),
      time: formatSolar(prevTerm.getSolar()),
    },
    nextTerm: {
      name: nextTerm.getName(),
      time: formatSolar(nextTerm.getSolar()),
    },
  };
}
