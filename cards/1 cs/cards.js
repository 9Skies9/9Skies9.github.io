/* =========================================================================
   CS stream  —  code projects (source: GitHub)
   -------------------------------------------------------------------------
   Add a card with card({ ... }). Drop cover images/gifs in ./images/ and
   point to them as cover: "cards/1 cs/images/<file>".

       card({
         date:  "2025",
         title: "project name",
         desc:  "one line about it",
         tags:  ["js", "webgl"],
         cover: "cards/1 cs/images/my-project.gif",   // optional
         url:   "https://github.com/9skie/repo",
         // count: 1234   ← optional; auto-fetched later
       })
   ========================================================================= */

window.STREAMS.cs = {
  label: "CS",
  sub: "GitHub",
  kind: "stars",
  aggregateLabel: "total GitHub stars across projects",
  items: [
    card({ date: "2025", title: "a cool project", desc: "a repo worth starring — mock data for now.", tags: ["js", "webgl"], url: "https://github.com/9skie", count: 1284 }),
    card({ date: "2024", title: "another repo", desc: "something I built that people actually used.", tags: ["python"], url: "https://github.com/9skie", count: 412 }),
    card({ date: "2024", title: "a tiny library", desc: "small, focused, does one thing well.", tags: ["ts", "lib"], url: "https://github.com/9skie", count: 96 }),
    card({ date: "2023", title: "weekend hack", desc: "built in two days, surprisingly sturdy.", tags: ["go", "cli"], url: "https://github.com/9skie", count: 57 }),
  ],
  archive: [
    card({ date: "~2022, maybe?", title: "old experiment", desc: "from the archive — dates get fuzzy past the line.", tags: ["c"], url: "#", count: 6 }),
  ],
};
