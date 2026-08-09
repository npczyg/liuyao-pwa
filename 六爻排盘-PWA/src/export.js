import { changedLineSymbol, lineSymbol } from './liuyao.js';

function describeHexagram(hexagram) {
  const tags = hexagram.tags.length ? `｜${hexagram.tags.join('、')}` : '';
  return `${hexagram.palaceName}宫${hexagram.stageDetail}｜${hexagram.name}｜世${hexagram.shi}应${hexagram.ying}${tags}`;
}

function describeLine(line, hasMoving) {
  const hidden = line.hidden
    ? `伏神${line.hidden.relation}${line.hidden.stemBranch}${line.hidden.element}｜`
    : '';
  const originalTags = line.original.tags.length ? `〔${line.original.tags.join('、')}〕` : '';
  const original = `${line.god}｜${hidden}${line.original.relation}${line.original.stemBranch}${line.original.element}｜${lineSymbol(line.value)}${line.original.shiYing ? ` ${line.original.shiYing}` : ''}${originalTags}`;
  if (!hasMoving) return `${line.positionName}｜${original}`;
  const changedTags = line.changed.tags.length ? `〔${line.changed.tags.join('、')}〕` : '';
  const arrow = line.moving ? '→' : '·';
  const changed = `${line.changed.relation}${line.changed.stemBranch}${line.changed.element}｜${changedLineSymbol(line.value)}${line.changed.shiYing ? ` ${line.changed.shiYing}` : ''}${changedTags}`;
  return `${line.positionName}｜${original} ${arrow} ${changed}`;
}

export function formatChartText(chart) {
  const { calendar } = chart;
  const lines = [
    `所占：${chart.question || '未填写'}`,
    `起卦：三枚乾隆通宝，手动录入（初爻至上爻）`,
    `公历：${calendar.displayTime}（北京时间）`,
    `干支：${calendar.year}年 ${calendar.month}月 ${calendar.day}日 ${calendar.time}时`,
    `月建：${calendar.monthCommand}　日辰：${calendar.dayCommand}　旬空：${calendar.voidText}（${calendar.xun}旬）`,
    `节气：${calendar.prevTerm.name} ${calendar.prevTerm.time} 后；${calendar.nextTerm.name} ${calendar.nextTerm.time} 前`,
    `换日：${calendar.rolloverText}`,
    '',
    `本卦：${describeHexagram(chart.original)}`,
    chart.hasMoving ? `变卦：${describeHexagram(chart.changed)}` : '变卦：无（六爻安静）',
    `本卦卦身：${chart.original.guaBody}`,
    chart.hasMoving ? `变卦卦身：${chart.changed.guaBody}` : '变卦卦身：无（六爻安静）',
    chart.patternTags.length ? `特殊结构：${chart.patternTags.join('、')}` : '特殊结构：无',
    '说明：变卦六亲按本卦所属宫五行排定。',
    '',
    '六爻排盘（上爻至初爻）：',
    ...[...chart.lines].reverse().map((line) => describeLine(line, chart.hasMoving)),
    '',
    '本盘仅列客观排盘数据，不包含吉凶分析。',
  ];
  return lines.join('\n');
}

function drawYao(ctx, x, y, yang, movingMark = '') {
  ctx.save();
  ctx.strokeStyle = '#f4ead2';
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  if (yang) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 148, y);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 59, y);
    ctx.moveTo(x + 89, y);
    ctx.lineTo(x + 148, y);
    ctx.stroke();
  }
  if (movingMark) {
    ctx.fillStyle = '#d95d4f';
    ctx.font = 'bold 42px "STKaiti", "KaiTi", serif';
    ctx.fillText(movingMark, x + 166, y + 13);
  }
  ctx.restore();
}

function fitText(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let result = text;
  while (result.length > 1 && ctx.measureText(`${result}…`).width > maxWidth) result = result.slice(0, -1);
  return `${result}…`;
}

function wrapByCharacters(text, maxCharacters = 28) {
  const lines = [];
  for (let index = 0; index < text.length; index += maxCharacters) {
    lines.push(text.slice(index, index + maxCharacters));
  }
  return lines.length ? lines : ['未填写'];
}

export function renderChartCanvas(chart) {
  const questionLines = wrapByCharacters(chart.question || '未填写', 30).slice(0, 3);
  const width = 1440;
  const headerHeight = 450 + (questionLines.length - 1) * 46;
  const rowHeight = 150;
  const height = headerHeight + rowHeight * 6 + 260;
  const scale = Math.min(window.devicePixelRatio || 1, 2);
  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#101713');
  gradient.addColorStop(0.55, '#1b211d');
  gradient.addColorStop(1, '#0c110f');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = '#9a7441';
  ctx.lineWidth = 3;
  ctx.strokeRect(28, 28, width - 56, height - 56);
  ctx.strokeStyle = 'rgba(195, 153, 87, 0.35)';
  ctx.strokeRect(42, 42, width - 84, height - 84);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#c69b5d';
  ctx.font = '700 62px "STKaiti", "KaiTi", serif';
  ctx.fillText('六 爻 排 盘', width / 2, 112);
  ctx.fillStyle = '#f0e2c5';
  ctx.font = '34px "STKaiti", "KaiTi", serif';
  questionLines.forEach((line, index) => ctx.fillText(line, width / 2, 170 + index * 46));

  const calendarY = 218 + (questionLines.length - 1) * 46;
  ctx.fillStyle = '#d9cab0';
  ctx.font = '29px "STKaiti", "KaiTi", serif';
  ctx.fillText(`${chart.calendar.year}年　${chart.calendar.month}月　${chart.calendar.day}日　${chart.calendar.time}时　（旬空：${chart.calendar.voidText}）`, width / 2, calendarY);
  ctx.font = '24px "STKaiti", "KaiTi", serif';
  ctx.fillStyle = '#a9987d';
  ctx.fillText(`${chart.calendar.displayTime} 北京时间｜${chart.calendar.rolloverText}｜${chart.calendar.prevTerm.name}后 ${chart.calendar.nextTerm.name}前`, width / 2, calendarY + 42);

  const headingY = calendarY + 118;
  ctx.font = '700 43px "STKaiti", "KaiTi", serif';
  ctx.fillStyle = '#f2e5c9';
  ctx.fillText(chart.original.name, 430, headingY);
  ctx.fillText(chart.hasMoving ? chart.changed.name : '六爻安静', 1030, headingY);
  ctx.font = '24px "STKaiti", "KaiTi", serif';
  ctx.fillStyle = '#b69159';
  ctx.fillText(`${chart.original.palaceName}宫${chart.original.stageDetail} · 世${chart.original.shi}应${chart.original.ying} · 卦身${chart.original.guaBody}`, 430, headingY + 39);
  ctx.fillText(chart.hasMoving ? `${chart.changed.palaceName}宫${chart.changed.stageDetail} · 世${chart.changed.shi}应${chart.changed.ying} · 卦身${chart.changed.guaBody}` : '无变卦', 1030, headingY + 39);

  const tableTop = headerHeight;
  ctx.strokeStyle = 'rgba(196, 157, 99, 0.24)';
  ctx.beginPath();
  ctx.moveTo(56, tableTop - 35);
  ctx.lineTo(width - 56, tableTop - 35);
  ctx.stroke();

  [...chart.lines].reverse().forEach((line, displayIndex) => {
    const top = tableTop + displayIndex * rowHeight;
    const mid = top + 61;
    ctx.textAlign = 'left';
    ctx.font = '28px "STKaiti", "KaiTi", serif';
    ctx.fillStyle = '#c6b79d';
    ctx.fillText(line.god, 72, mid + 10);

    ctx.font = '25px "STKaiti", "KaiTi", serif';
    ctx.fillStyle = line.hidden ? '#8ca88e' : '#5d675f';
    ctx.fillText(line.hidden ? `伏${line.hidden.relation}${line.hidden.stemBranch}` : '　', 166, mid + 10);

    ctx.fillStyle = '#eee0c3';
    ctx.font = '30px "STKaiti", "KaiTi", serif';
    ctx.fillText(line.original.relation, 330, mid + 10);
    drawYao(ctx, 430, mid, line.original.yang, line.mark);
    ctx.fillText(`${line.original.stemBranch}${line.original.element}`, 632, mid + 10);
    if (line.original.shiYing) {
      ctx.fillStyle = '#4aa0c7';
      ctx.font = '700 32px "STKaiti", "KaiTi", serif';
      ctx.fillText(line.original.shiYing, 747, mid + 10);
    }

    if (chart.hasMoving) {
      ctx.fillStyle = line.moving ? '#c69b5d' : '#59645d';
      ctx.font = '30px serif';
      ctx.fillText(line.moving ? '→' : '·', 790, mid + 10);
      ctx.fillStyle = '#eee0c3';
      ctx.font = '30px "STKaiti", "KaiTi", serif';
      ctx.fillText(line.changed.relation, 842, mid + 10);
      drawYao(ctx, 934, mid, line.changed.yang);
      ctx.fillText(`${line.changed.stemBranch}${line.changed.element}`, 1100, mid + 10);
      if (line.changed.shiYing) {
        ctx.fillStyle = '#4aa0c7';
        ctx.font = '700 32px "STKaiti", "KaiTi", serif';
        ctx.fillText(line.changed.shiYing, 1285, mid + 10);
      }
    }

    const tags = [...line.original.tags, ...(line.moving ? line.changed.tags : [])];
    if (tags.length) {
      ctx.fillStyle = '#aa7654';
      ctx.font = '21px "STKaiti", "KaiTi", serif';
      ctx.fillText(fitText(ctx, tags.join(' · '), 540), 842, mid + 47);
    }

    ctx.strokeStyle = 'rgba(196, 157, 99, 0.13)';
    ctx.beginPath();
    ctx.moveTo(72, top + rowHeight - 15);
    ctx.lineTo(width - 72, top + rowHeight - 15);
    ctx.stroke();
  });

  const footerY = tableTop + rowHeight * 6 + 40;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#c69b5d';
  ctx.font = '30px "STKaiti", "KaiTi", serif';
  const bodySummary = chart.hasMoving
    ? `本卦卦身：${chart.original.guaBody}　变卦卦身：${chart.changed.guaBody}`
    : `本卦卦身：${chart.original.guaBody}`;
  const summary = [bodySummary, ...chart.original.tags, ...chart.changed.tags, ...chart.patternTags].join('　');
  ctx.fillText(summary, width / 2, footerY);
  ctx.fillStyle = '#776f60';
  ctx.font = '22px "STKaiti", "KaiTi", serif';
  ctx.fillText('京房八宫纳甲 · 盘面数据不作吉凶判断', width / 2, footerY + 66);

  return canvas;
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('无法生成盘面图片'))), 'image/png', 1);
  });
}

export async function saveChartImage(chart) {
  const canvas = renderChartCanvas(chart);
  const blob = await canvasToBlob(canvas);
  const safeQuestion = (chart.question || '六爻排盘').replace(/[\\/:*?"<>|]/g, '').slice(0, 18);
  const filename = `${safeQuestion}-${chart.calendar.solarText.slice(0, 10)}.png`;
  const file = new File([blob], filename, { type: 'image/png' });

  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: '六爻排盘', text: chart.question || '六爻排盘' });
    return '已打开系统分享，可选择“存储到照片”或发送给AI';
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return '盘面图片已生成';
}
