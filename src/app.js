import {
  getCalendarInfo,
  getShanghaiNowParts,
  parseDateTimeLocal,
  toDateTimeLocalValue,
} from './calendar.js';
import {
  buildChart,
  changedLineSymbol,
  coinFacesToValue,
  LINE_POSITION_NAMES,
  LINE_TYPES,
  lineSymbol,
} from './liuyao.js';
import { formatChartText, saveChartImage } from './export.js';

const app = document.querySelector('#app');

const state = {
  view: 'setup',
  question: '',
  lockedDateValue: '',
  rollover: '23',
  calendar: null,
  values: [],
  faces: ['front', 'front', 'front'],
  chart: null,
};

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function appShell(content) {
  return `
    <main class="app-shell">
      <header class="masthead">
        <div class="bagua-mark" aria-hidden="true">
          <span>☰</span><span>☷</span>
        </div>
        <div>
          <p class="eyebrow">京房八宫 · 纳甲排盘</p>
          <h1>六爻排盘</h1>
        </div>
        <div class="yin-yang" aria-hidden="true">☯</div>
      </header>
      ${!isStandalone() ? `
        <aside class="install-note">
          <span class="seal">安</span>
          <p><strong>安装到 iPhone：</strong>使用 Safari 打开后，点“分享”→“添加到主屏幕”。</p>
        </aside>
      ` : ''}
      ${content}
      <footer class="site-footer">盘面只列客观数据 · 不作吉凶判断</footer>
    </main>
    <div id="toast" class="toast" role="status" aria-live="polite"></div>
  `;
}

function renderSetup() {
  const nowValue = toDateTimeLocalValue(getShanghaiNowParts());
  app.innerHTML = appShell(`
    <section class="paper-card setup-card">
      <div class="section-heading">
        <span class="section-number">壹</span>
        <div><p>立问定时</p><h2>写下所占之事</h2></div>
      </div>
      <form id="setup-form" class="setup-form">
        <label class="field-label" for="question">所占事项</label>
        <textarea id="question" maxlength="120" rows="3" placeholder="例如：问近期求职进展如何？"></textarea>

        <label class="field-label" for="datetime">起卦时间（北京时间）</label>
        <input id="datetime" type="datetime-local" value="${nowValue}" required />

        <fieldset class="rollover-field">
          <legend>换日方式</legend>
          <label><input type="radio" name="rollover" value="23" checked /><span>23点换日</span></label>
          <label><input type="radio" name="rollover" value="0" /><span>0点换日</span></label>
        </fieldset>

        <div class="privacy-note">
          <span>隐</span>
          <p>本次盘面只保留在当前页面；关闭或重新进入后自动清除。</p>
        </div>

        <button class="primary-button" type="submit">开始起卦</button>
      </form>
    </section>
  `);

  document.querySelector('#setup-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const datetimeValue = document.querySelector('#datetime').value;
    const rollover = document.querySelector('input[name="rollover"]:checked').value;
    try {
      state.question = document.querySelector('#question').value.trim();
      state.lockedDateValue = datetimeValue;
      state.rollover = rollover;
      state.calendar = getCalendarInfo(parseDateTimeLocal(datetimeValue), rollover);
      state.view = 'toss';
      render();
    } catch (error) {
      showToast(error.message, true);
    }
  });
}

function coinMarkup(face, index) {
  const front = face === 'front';
  return `
    <button class="coin ${front ? 'coin-front' : 'coin-back'}" type="button" data-coin="${index}" aria-label="第${index + 1}枚铜钱，当前为${front ? '字面' : '背面'}，点击翻转">
      <span class="coin-rim"></span>
      <span class="coin-hole"></span>
      ${front ? `
        <span class="coin-char coin-top">乾</span>
        <span class="coin-char coin-right">隆</span>
        <span class="coin-char coin-bottom">通</span>
        <span class="coin-char coin-left">宝</span>
      ` : `
        <span class="manchu-mark manchu-left">ᠪᠣᠣ</span>
        <span class="manchu-mark manchu-right">ᠴᡳᠣᠸᠠᠨ</span>
        <span class="coin-back-label">背</span>
      `}
      <span class="coin-caption">${front ? '字 · 阴 · 2' : '背 · 阳 · 3'}</span>
    </button>
  `;
}

function miniYao(value, index) {
  const type = LINE_TYPES[value];
  return `
    <div class="mini-yao">
      <span>${LINE_POSITION_NAMES[index].replace('爻', '')}</span>
      <i class="yao ${type.yang ? 'yang' : 'yin'}"></i>
      <b>${type.mark}</b>
    </div>
  `;
}

function renderToss() {
  const currentPosition = state.values.length + 1;
  const currentValue = coinFacesToValue(state.faces);
  const currentType = LINE_TYPES[currentValue];
  const backs = state.faces.filter((face) => face === 'back').length;
  const fronts = 3 - backs;
  const positionName = LINE_POSITION_NAMES[currentPosition - 1];

  app.innerHTML = appShell(`
    <section class="paper-card toss-card">
      <div class="section-heading compact">
        <span class="section-number">贰</span>
        <div><p>三钱六掷</p><h2>录入${positionName}</h2></div>
        <span class="progress-count">${currentPosition}<small>/6</small></span>
      </div>

      <div class="locked-time">
        <span>时</span>
        <div>
          <strong>${escapeHtml(state.calendar.displayTime)}</strong>
          <small>${state.calendar.year}年 ${state.calendar.month}月 ${state.calendar.day}日 ${state.calendar.time}时 · 旬空${state.calendar.voidText}</small>
        </div>
      </div>

      <p class="toss-instruction">依照实际落下的正反面，逐枚点击乾隆通宝进行翻转。</p>
      <div class="coins" aria-label="三枚乾隆通宝">
        ${state.faces.map(coinMarkup).join('')}
      </div>

      <div class="current-result">
        <div>
          <span>${fronts}字 ${backs}背</span>
          <strong>${currentType.name}</strong>
        </div>
        <div class="large-yao">
          <i class="yao ${currentType.yang ? 'yang' : 'yin'}"></i>
          <b>${currentType.mark}</b>
        </div>
      </div>

      <div class="recorded-lines">
        <p>已录爻象 <small>自下而上</small></p>
        <div class="mini-yaos">${state.values.length ? state.values.map(miniYao).join('') : '<span class="empty-record">尚未记录</span>'}</div>
      </div>

      <div class="button-row">
        <button id="undo-line" class="ghost-button" type="button" ${state.values.length ? '' : 'disabled'}>退回一爻</button>
        <button id="record-line" class="primary-button" type="button">记录${positionName}</button>
      </div>
      <button id="restart" class="text-button" type="button">放弃本次，重新开始</button>
    </section>
  `);

  document.querySelectorAll('[data-coin]').forEach((button) => {
    button.addEventListener('click', () => {
      const index = Number(button.dataset.coin);
      state.faces[index] = state.faces[index] === 'front' ? 'back' : 'front';
      renderToss();
    });
  });

  document.querySelector('#record-line').addEventListener('click', () => {
    state.values.push(coinFacesToValue(state.faces));
    state.faces = ['front', 'front', 'front'];
    if (state.values.length === 6) {
      state.chart = buildChart({ values: state.values, calendar: state.calendar, question: state.question });
      state.view = 'result';
    }
    render();
  });

  document.querySelector('#undo-line').addEventListener('click', () => {
    state.values.pop();
    renderToss();
  });

  document.querySelector('#restart').addEventListener('click', () => window.location.reload());
}

function yaoMarkup(yang, mark = '') {
  return `<span class="chart-yao"><i class="yao ${yang ? 'yang' : 'yin'}"></i>${mark ? `<b>${mark}</b>` : ''}</span>`;
}

function tagMarkup(tags) {
  return tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');
}

function chartRowMarkup(line, hasMoving) {
  const originalTags = line.original.tags;
  const changedTags = line.moving ? line.changed.tags : [];
  return `
    <div class="hex-row ${line.moving ? 'moving-row' : ''}">
      <div class="god-cell">${line.god}</div>
      <div class="hidden-cell">${line.hidden ? `<span>伏</span>${line.hidden.relation}${line.hidden.stemBranch}` : ''}</div>
      <div class="line-side original-side">
        <span class="relation">${line.original.relation}</span>
        ${yaoMarkup(line.original.yang, line.mark)}
        <span class="branch">${line.original.stemBranch}<small>${line.original.element}</small></span>
        <b class="shi-ying">${line.original.shiYing}</b>
      </div>
      <div class="change-arrow">${hasMoving ? (line.moving ? '→' : '·') : ''}</div>
      <div class="line-side changed-side ${hasMoving ? '' : 'no-change'}">
        ${hasMoving ? `
          <span class="relation">${line.changed.relation}</span>
          ${yaoMarkup(line.changed.yang)}
          <span class="branch">${line.changed.stemBranch}<small>${line.changed.element}</small></span>
          <b class="shi-ying">${line.changed.shiYing}</b>
        ` : '<span>—</span>'}
      </div>
      ${(originalTags.length || changedTags.length) ? `<div class="line-tags">${tagMarkup([...originalTags, ...changedTags])}</div>` : ''}
    </div>
  `;
}

function renderResult() {
  const chart = state.chart;
  const summaryTags = [...new Set([...chart.original.tags, ...chart.changed.tags, ...chart.patternTags])];
  app.innerHTML = appShell(`
    <section class="result-section">
      <div class="paper-card result-meta">
        <div class="section-heading compact">
          <span class="section-number">叁</span>
          <div><p>卦成列盘</p><h2>${escapeHtml(chart.question || '本次六爻排盘')}</h2></div>
        </div>
        <p class="pillars">${chart.calendar.year}年　${chart.calendar.month}月　${chart.calendar.day}日　${chart.calendar.time}时</p>
        <div class="calendar-grid">
          <span><small>月建</small>${chart.calendar.monthCommand}</span>
          <span><small>日辰</small>${chart.calendar.dayCommand}</span>
          <span><small>旬空</small>${chart.calendar.voidText}</span>
          <span class="dual-body"><small>卦身</small>${chart.hasMoving ? `本${chart.original.guaBody} · 变${chart.changed.guaBody}` : chart.original.guaBody}</span>
        </div>
        <p class="term-line">${chart.calendar.prevTerm.name}后 · ${chart.calendar.nextTerm.name}前 · ${chart.calendar.rolloverText}</p>
      </div>

      <div id="chart-card" class="paper-card chart-card">
        <div class="hex-headings">
          <div>
            <small>${chart.original.palaceName}宫${chart.original.stageDetail} · 世${chart.original.shi}应${chart.original.ying}</small>
            <h3>${chart.original.name}</h3>
          </div>
          <span>之</span>
          <div>
            <small>${chart.hasMoving ? `${chart.changed.palaceName}宫${chart.changed.stageDetail} · 世${chart.changed.shi}应${chart.changed.ying}` : '六爻安静'}</small>
            <h3>${chart.hasMoving ? chart.changed.name : '无变卦'}</h3>
          </div>
        </div>
        <div class="chart-legend"><span>六神</span><span>伏神</span><span>本卦</span><span></span><span>变卦</span></div>
        <div class="hex-lines">
          ${[...chart.lines].reverse().map((line) => chartRowMarkup(line, chart.hasMoving)).join('')}
        </div>
        <div class="gua-bodies">
          <span>本卦卦身：${chart.original.guaBody}</span>
          <i>·</i>
          <span>${chart.hasMoving ? `变卦卦身：${chart.changed.guaBody}` : '变卦卦身：无'}</span>
        </div>
        ${summaryTags.length ? `<div class="summary-tags">${tagMarkup(summaryTags)}</div>` : ''}
        <p class="relation-note">变卦六亲沿用本卦所属宫五行排定</p>
      </div>

      <div class="action-grid">
        <button id="copy-chart" class="primary-button" type="button">复制完整文字</button>
        <button id="save-image" class="secondary-button" type="button">保存盘面图片</button>
      </div>
      <button id="new-chart" class="ghost-button full-width" type="button">重新进入，另起一卦</button>
    </section>
  `);

  document.querySelector('#copy-chart').addEventListener('click', async () => {
    try {
      const text = formatChartText(chart);
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.append(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
      }
      showToast('完整文字盘已复制，可直接发送给AI');
    } catch (error) {
      showToast(`复制失败：${error.message}`, true);
    }
  });

  document.querySelector('#save-image').addEventListener('click', async () => {
    const button = document.querySelector('#save-image');
    button.disabled = true;
    button.textContent = '正在生成…';
    try {
      showToast(await saveChartImage(chart));
    } catch (error) {
      if (error.name !== 'AbortError') showToast(`保存失败：${error.message}`, true);
    } finally {
      button.disabled = false;
      button.textContent = '保存盘面图片';
    }
  });

  document.querySelector('#new-chart').addEventListener('click', () => window.location.reload());
}

function showToast(message, isError = false) {
  const toast = document.querySelector('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast show ${isError ? 'error' : ''}`;
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => { toast.className = 'toast'; }, 3200);
}

function render() {
  if (state.view === 'setup') renderSetup();
  if (state.view === 'toss') renderToss();
  if (state.view === 'result') renderResult();
}

render();

if ('serviceWorker' in navigator && !['localhost', '127.0.0.1'].includes(window.location.hostname)) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
