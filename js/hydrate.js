/* =========================================================================
   hydrate.js  —  auto-hook card counts from their URLs
   =========================================================================
   Every card has a `url` and an optional static `count` (the fallback).
   When a stream is selected, Hydrate.stream() walks its cards and upgrades
   each count from the best available source, in priority order:

     1. BAKED counts  — window.BAKED_COUNTS from cards/counts.js, generated
        offline by tools/sync_counts.py. Covers providers the browser can't
        reach (Pixiv: login required; Bilibili: no CORS) and pins numbers
        you want fixed. Works from file:// because it's a plain script.
     2. LIVE fetch    — the only provider the browser can call keyless:
           GitHub   api.github.com            (no key, 60 req/h, cached 1h)
     3. STATIC count  — whatever the card already has. Always the fallback.

   No API keys in public files, ever — providers that need one are baked.

   To add a provider: push { name, match, fetch } onto PROVIDERS.
     match(url) -> id string | null     (null = this url isn't yours)
     fetch(id)  -> Promise<number>      (the metric: stars/views/likes)
   ========================================================================= */

(function () {
  'use strict';

  const TTL = 60 * 60 * 1000;   // live results cached 1h in localStorage

  /* ---- cache ---------------------------------------------------------- */
  function cacheGet(key) {
    try {
      const raw = localStorage.getItem('count:' + key);
      if (!raw) return null;
      const c = JSON.parse(raw);
      if (Date.now() - c.t < TTL) return c.n;
    } catch (e) {}
    return null;
  }
  function cacheSet(key, n) {
    try { localStorage.setItem('count:' + key, JSON.stringify({ t: Date.now(), n })); } catch (e) {}
  }
  async function cached(key, fn) {
    const hit = cacheGet(key);
    if (hit != null) return hit;
    const n = await fn();
    cacheSet(key, n);
    return n;
  }

  /* ---- live providers -------------------------------------------------- */
  const PROVIDERS = [
    {
      name: 'github',
      // https://github.com/owner/repo -> 'owner/repo'
      match(url) {
        try {
          const u = new URL(url);
          if (u.hostname !== 'github.com' && u.hostname !== 'www.github.com') return null;
          const p = u.pathname.split('/').filter(Boolean);
          return p.length >= 2 ? p[0] + '/' + p[1] : null;
        } catch (e) { return null; }
      },
      async fetch(repo) {
        const res = await fetch('https://api.github.com/repos/' + repo, {
          headers: { Accept: 'application/vnd.github+json' },
        });
        if (!res.ok) throw new Error('github ' + res.status);
        return (await res.json()).stargazers_count || 0;
      },
    },
    /* YouTube, Pixiv + Bilibili are intentionally NOT here:
         - YouTube needs an API key, and keys never go in public files
         - Pixiv needs OAuth login, Bilibili sends no CORS headers
       tools/sync_counts.py handles all three offline into cards/counts.js. */
  ];

  function detect(url) {
    for (const p of PROVIDERS) {
      const id = p.match(url);
      if (id) return { p, id };
    }
    return null;
  }

  /* ---- public: hydrate every card of a stream, then callback ---------- */
  async function stream(s, onDone) {
    const baked = window.BAKED_COUNTS || {};
    const all = (s.items || []).concat(s.archive || []);
    await Promise.all(all.map(async (it) => {
      if (baked[it.url] != null) it.count = baked[it.url];   // baseline
      const hit = detect(it.url);
      if (!hit) return;
      try {
        it.count = await cached(hit.p.name + ':' + hit.id, () => hit.p.fetch(hit.id));
      } catch (e) { /* keep baked/static count */ }
    }));
    if (onDone) onDone();
  }

  window.Hydrate = { stream, detect };
})();
