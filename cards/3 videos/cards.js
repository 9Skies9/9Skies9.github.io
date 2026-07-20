/* =========================================================================
   VIDEO stream  —  motion work (source: Bilibili / YouTube)
   -------------------------------------------------------------------------
   Add a card with card({ ... }). Drop cover images/gifs in ./images/ and
   point to them as cover: "cards/3 videos/images/<file>".

       card({
         date:  "2025-04",
         title: "video title",
         desc:  "one line about it",
         tags:  ["tutorial", "webgl"],
         cover: "cards/3 videos/images/thumb.gif",   // optional
         url:   "https://www.youtube.com/watch?v=...",
         // count: 1234   ← optional; auto-fetched later (views)
       })
   ========================================================================= */

window.STREAMS.video = {
  label: "Video",
  sub: "Bilibili / YouTube",
  kind: "views",
  aggregateLabel: "total views (from both platforms) across videos",
  items: [
    card({ date: "2025-04", title: "how a shader works", desc: "a 4-minute explainer on signed distance fields.", tags: ["tutorial", "webgl"], url: "#", count: 21450 }),
    card({ date: "2024-12", title: "timelapse — a painting", desc: "8 hours compressed to 90 seconds.", tags: ["timelapse", "art"], url: "#", count: 5310 }),
    card({ date: "2024-02", title: "a short film", desc: "monochrome, made in a weekend.", tags: ["film", "b&w"], url: "#", count: 9902 }),
  ],
  archive: [
    card({ date: "~2022", title: "first upload", desc: "rough cut, real heart in it.", tags: ["vlog"], url: "#", count: 240 }),
  ],
};
