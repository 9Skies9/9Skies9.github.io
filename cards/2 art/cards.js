/* =========================================================================
   ART stream  —  illustrations (source: Pixiv)
   -------------------------------------------------------------------------
   Add a card with card({ ... }). Drop cover images/gifs in ./images/ and
   point to them as cover: "cards/2 art/images/<file>".

       card({
         date:  "2025-03",
         title: "artwork name",
         desc:  "one line about it",
         tags:  ["study", "greyscale"],
         cover: "cards/2 art/images/artwork.png",   // optional
         url:   "https://www.pixiv.net/...",
         // count: 1234   ← optional; auto-fetched later (bookmarks)
       })
   ========================================================================= */

window.STREAMS.art = {
  label: "Art",
  sub: "Pixiv",
  kind: "bookmarks",
  aggregateLabel: "total bookmarks across works",
  items: [
    card({ date: "2025-03", title: "study — light through glass", desc: "a personal study chasing the grey light.", tags: ["study", "greyscale"], url: "#", count: 384 }),
    card({ date: "2024-11", title: "vocaloid fanart", desc: "初音ミク, low-poly treatment.", tags: ["fanart", "miku"], url: "#", count: 1290 }),
    card({ date: "2024-06", title: "portrait series #2", desc: "three faces, one mood.", tags: ["portrait", "series"], url: "#", count: 612 }),
  ],
  archive: [
    card({ date: "~2023", title: "early sketches", desc: "rough, but they meant something.", tags: ["sketch"], url: "#", count: 88 }),
    card({ date: "sometime earlier", title: "first post", desc: "where it started.", tags: ["doodle"], url: "#", count: 12 }),
  ],
};
