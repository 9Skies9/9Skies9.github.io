/* =========================================================================
   main.js  —  menu screen + stream panel
   =========================================================================
   Renders the menu (identity, roots feed, stream tiles) and the selected
   stream's aggregate number + cards (+ dimmed archive past the OFF LIMITS
   line). Clicking a tile switches streams. Stream data lives in cards/*,
   CS star counts are fetched live from GitHub.
   ========================================================================= */

(function () {
  'use strict';

  const METRIC = {
    stars:     { glyph: '✰', label: 'stars' },
    likes:     { glyph: 'ദ്ദി', label: 'likes' },
    views:     { glyph: '𓁹', label: 'views' },
  };
  const ICON = { cs: '&lt;/&gt;', art: 'ᝰ', video: '▶' };

  const $  = (s, r = document) => r.querySelector(s);
  const fmt = (n) => (n || 0).toLocaleString('en-US');
  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  /* ---- card count hydration -------------------------------------------
     Counts are auto-hooked from each card's url by js/hydrate.js (live
     GitHub/YouTube fetch + baked counts from tools/sync_counts.py).
     Runs once per stream, then re-renders if that stream is still shown. */
  let currentStream = null;
  const hydrated = new Set();

  function hydrateStream(key) {
    const s = STREAMS[key];
    if (!s || !window.Hydrate) return;
    Hydrate.stream(s, () => {
      if (currentStream === key) {
        const m = METRIC[s.kind] || METRIC.stars;
        renderDeck(s.items || [], s.archive || [], m);
        countUp($('#agg-num'), aggregate(s));
      }
    });
  }

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    fillIdentity();
    renderFeed();
    renderStreams();
    setupSelector();
    setupSearch();
    selectStream('cs');          // CS active + content shown by default
    setupBlocks();
    startClock();
  }

  /* ---- identity ---- */
  function fillIdentity() {
    document.querySelectorAll('[data-fill]').forEach((el) => {
      el.textContent = IDENTITY[el.dataset.fill] || '';
    });
  }

  /* ---- roots feed ---- */
  function renderFeed() {
    const feed = $('#feed');
    if (!feed) return;
    feed.innerHTML = ROOTS
      .map(([cat, val]) => `<dt>${esc(cat)}</dt><dd>${esc(val)}</dd>`)
      .join('');
  }

  function aggregate(stream) {
    const sum = (arr) => (arr || []).reduce((s, it) => s + (it.count || 0), 0);
    return sum(stream.items) + sum(stream.archive);
  }

  /* ---- stream tiles ---- */
  function renderStreams() {
    const list = $('#stream-list');
    if (!list) return;
    const keys = Object.keys(STREAMS);
    list.innerHTML = keys.map((key, i) => {
      const s = STREAMS[key];
      const active = i === 0 ? ' is-active' : '';
      return `
        <button class="tile${active}" data-stream="${esc(key)}" type="button">
          <span class="tile__ico">${ICON[key] || '·'}</span>
          <span class="tile__lbl">${esc(s.label)}</span>
          <span class="tile__sub">${esc(s.sub || '')}</span>
        </button>`;
    }).join('');
  }

  function setupSelector() {
    document.querySelectorAll('.tile').forEach((t) => {
      t.addEventListener('click', () => selectStream(t.dataset.stream));
    });
  }

  function setupSearch() {
    const input = $('#search');
    if (input) {
      input.addEventListener('input', () => {
        const q = input.value.trim().toLowerCase();
        document.querySelectorAll('#cards .entry').forEach((entry) => {
          const titleEl = entry.querySelector('.entry__title');
          const title = titleEl ? titleEl.textContent : '';
          const tags = Array.from(entry.querySelectorAll('.card__tag'))
            .map((t) => t.textContent).join(' ');
          const hay = (title + ' ' + tags).toLowerCase();
          entry.classList.toggle('is-hidden', q !== '' && !hay.includes(q));
        });
      });
    }
    const top = $('#deck-top');
    if (top) {
      top.addEventListener('click', () => {
        const deck = $('#cards');
        if (deck) deck.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  /* ---- switch the active stream: aggregate + cards + archive ---- */
  function selectStream(key) {
    const s = STREAMS[key];
    if (!s) return;
    const changed = key !== currentStream;
    currentStream = key;
    const m = METRIC[s.kind] || METRIC.stars;

    document.querySelectorAll('.tile').forEach((t) =>
      t.classList.toggle('is-active', t.dataset.stream === key));

    const dotsEl = $('#hud-dots');
    if (dotsEl) {
      const keys = Object.keys(STREAMS);
      const idx = keys.indexOf(key);
      dotsEl.textContent = keys.map((_, i) => i === idx ? '●' : '○').join(' ');
    }

    const searchInput = $('#search');
    if (searchInput) searchInput.value = '';

    $('#agg-glyph').textContent = m.glyph;
    $('#agg-label').textContent = s.aggregateLabel;
    countUp($('#agg-num'), aggregate(s));

    renderDeck(s.items || [], s.archive || [], m);

    // reset the deck to the top when the stream actually changes
    if (changed) {
      const deck = $('#cards');
      if (deck) deck.scrollTop = 0;
    }

    // auto-hook counts from card urls (once per stream)
    if (!hydrated.has(key)) {
      hydrated.add(key);
      hydrateStream(key);
    }
  }

  function renderDeck(items, archiveItems, m) {
    const timeline = $('#timeline');
    const archive = $('#archive');
    if (timeline) timeline.innerHTML = items.map((it) => entryHTML(it, m)).join('');
    if (archive) archive.innerHTML = archiveItems.map((it) => entryHTML(it, m)).join('');
    const hasArchive = archiveItems.length > 0;
    document.querySelectorAll('#cards > .offlimits, #cards > .archive-wrap').forEach((el) => {
      el.style.display = hasArchive ? '' : 'none';
    });
  }

  function entryHTML(it, m) {
    return `
      <div class="entry">
        <span class="rail-dot"></span>
        <div class="entry__head"><span class="entry__date">${esc(it.date)}</span> <span class="entry__dash">-</span> <span class="entry__title">${esc(it.title)}</span></div>
        ${cardHTML(it, m)}
      </div>`;
  }

  function cardHTML(it, m) {
    const tags = (it.tags || []).map((t) => `<span class="card__tag">${esc(t)}</span>`).join('');
    return `
      <article class="card">
        <div class="card__top">
          <div class="card__front"${it.cover ? ` style="background-image:url('${esc(it.cover)}')"` : ''}></div>
          <div class="card__count">
            <span class="card__count-glyph">${m.glyph}</span>
            <span class="card__count-num">${it.count == null ? '—' : fmt(it.count)}</span>
            <span class="card__count-label">${m.label}</span>
          </div>
        </div>
        <div class="card__meta">
          <div class="card__tags">${tags}</div>
          <a class="card__src" href="${esc(it.url || '#')}" target="_blank" rel="noopener">view \u2197</a>
        </div>
        <p class="card__desc">${esc(it.desc || '')}</p>
      </article>`;
  }

  /* ---- animated count-up (no library) ---- */
  function countUp(el, to) {
    if (!el) return;
    const dur = 900;
    const start = performance.now();
    function step(now) {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = fmt(Math.round(to * eased));
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---- flat grey block field + drifting bars (background) --------------
     wowaka-style: hard-edged neutral-grey blocks and long dark bars on a
     paper field, redrawn at ~12fps on purpose (frame-skip = retro). Blocks
     pop in/out staccato (solid color blended toward the paper, never alpha);
     bars drift slowly and wrap. Every few seconds a
     short glitch burst shifts horizontal slices of the canvas sideways and
     snap-shifts the hero geometry (via .is-glitch on .title-wrap). */
  function setupBlocks() {
    const field = document.getElementById('bg-blocks');
    if (!field || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = field.getContext('2d');
    let W = 0, H = 0, dpr = 1;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = field.clientWidth || window.innerWidth;
      H = field.clientHeight || window.innerHeight;
      field.width = Math.round(W * dpr);
      field.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    const GREYS = ['#d4d4d4', '#c6c6c6', '#b2b2b2', '#9d9d9d'];
    const COUNT = 14;
    const FRAME_MS = 1000 / 12;          // deliberate frame-skip
    const POP_MS = 160;                  // staccato blend at birth/death

    // fade = blend the solid grey toward the paper color (opaque, no alpha):
    // paper -> grey at birth, grey -> paper at death, same timing as before
    const PAPER = [233, 233, 233];       // --paper #e9e9e9
    function mixGrey(hex, t) {
      const n = parseInt(hex.slice(1), 16);
      const r = n >> 16, g = (n >> 8) & 255, b = n & 255;
      return `rgb(${Math.round(PAPER[0] + (r - PAPER[0]) * t)},`
           + `${Math.round(PAPER[1] + (g - PAPER[1]) * t)},`
           + `${Math.round(PAPER[2] + (b - PAPER[2]) * t)})`;
    }

    // a connected cluster of 1-5 rectangles -> composite shapes
    function makeParts(s) {
      const cells = [{ x: 0, y: 0 }];
      const n = 1 + ((Math.random() * 4) | 0);
      for (let i = 1; i < n; i++) {
        const b = cells[(Math.random() * cells.length) | 0];
        const c = { x: b.x, y: b.y };
        const d = (Math.random() * 4) | 0;
        c.x += d === 0 ? 1 : d === 1 ? -1 : 0;
        c.y += d === 2 ? 1 : d === 3 ? -1 : 0;
        if (!cells.some((p) => p.x === c.x && p.y === c.y)) cells.push(c);
      }
      return cells.map((c) => ({
        x: c.x * s, y: c.y * s,
        w: s * (0.7 + Math.random() * 0.6),
        h: s * (0.7 + Math.random() * 0.6),
      }));
    }

    function spawnBlock(stagger) {
      const s = 40 + Math.random() * 110;
      const dur = 4000 + Math.random() * 5000;
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        size: s,
        parts: makeParts(s),
        grey: GREYS[(Math.random() * GREYS.length) | 0],
        vx: (Math.random() - 0.5) * 0.03,   // px per ms
        vy: (Math.random() - 0.5) * 0.03,
        born: stagger ? performance.now() - Math.random() * dur : performance.now(),
        dur,
      };
    }

    // long bars crossing the field, like the reference composition
    const bars = [];
    for (let i = 0; i < 4; i++) {
      bars.push({
        horiz: Math.random() < 0.6,
        pos: Math.random(),                          // fraction along cross axis
        thick: 6 + Math.random() * 14,
        speed: (Math.random() - 0.5) * 0.00002,      // fraction per ms
        dark: Math.random() < 0.5,
      });
    }

    const blocks = [];
    for (let i = 0; i < COUNT; i++) blocks.push(spawnBlock(true));

    /* glitch bursts: rare + short (tasteful) */
    const titleWrap = document.querySelector('.title-wrap');
    let glitchUntil = 0;
    let nextGlitch = performance.now() + 3000 + Math.random() * 4000;

    function triggerGlitch(now) {
      const ms = 120 + Math.random() * 120;
      glitchUntil = now + ms;
      nextGlitch = now + 4000 + Math.random() * 6000;
      if (titleWrap) {
        titleWrap.classList.add('is-glitch');
        setTimeout(() => titleWrap.classList.remove('is-glitch'), ms);
      }
    }

    function sliceGlitch() {
      for (let i = 0; i < 3; i++) {
        const sy = Math.random() * H;
        const sh = 6 + Math.random() * 30;
        const dx = (Math.random() - 0.5) * 64;
        ctx.drawImage(field,
          0, sy * dpr, field.width, sh * dpr,   // source (device px)
          dx, sy, W, sh);                        // dest (css px, transformed)
      }
    }

    let last = 0;
    function frame(now) {
      requestAnimationFrame(frame);
      if (now - last < FRAME_MS) return;
      const dt = now - last;
      last = now;

      if (now >= nextGlitch) triggerGlitch(now);

      ctx.clearRect(0, 0, W, H);

      // blocks (solid grey, blended toward the paper at birth/death)
      for (let i = 0; i < blocks.length; i++) {
        let b = blocks[i];
        const age = now - b.born;
        if (age >= b.dur) { blocks[i] = b = spawnBlock(false); continue; }
        b.x += b.vx * dt; b.y += b.vy * dt;
        const t = Math.min(age / POP_MS, (b.dur - age) / POP_MS, 1);
        if (t <= 0) continue;
        ctx.fillStyle = mixGrey(b.grey, t);
        for (let j = 0; j < b.parts.length; j++) {
          const p = b.parts[j];
          ctx.fillRect(b.x + p.x, b.y + p.y, p.w, p.h);
        }
      }

      // bars (over blocks, like the reference)
      for (const bar of bars) {
        bar.pos = (bar.pos + bar.speed * dt + 1) % 1;
        ctx.fillStyle = bar.dark ? '#2e2e2e' : '#8c8c8c';
        if (bar.horiz) ctx.fillRect(-20, bar.pos * H, W + 40, bar.thick);
        else ctx.fillRect(bar.pos * W, -20, bar.thick, H + 40);
      }

      if (now < glitchUntil) sliceGlitch();
    }
    requestAnimationFrame(frame);
  }

  function startClock() {
    const el = $('#hud-clock');
    if (!el) return;
    const tick = () => {
      const d = new Date();
      const p = (n) => String(n).padStart(2, '0');
      el.textContent = `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
    };
    tick();
    setInterval(tick, 1000);
  }
})();
