/* =========================================================================
   card.js  —  shared card factory
   =========================================================================
   Used by every cards/<stream>/cards.js. Keeps card shape consistent and
   gives every field a sane default.

     card({
       date:  "2025",
       title: "project name",
       desc:  "one line about it",
       tags:  ["js", "webgl"],
       cover: "cards/1 cs/images/cover.gif",   // optional image/gif for the front
       url:   "https://github.com/9skie/repo",
       count: 1234,                          // optional; auto-fetched later
     })
   ========================================================================= */

function card({ date, title, desc = "", tags = [], url = "#", cover = "", count }) {
  return { date, title, desc, tags, url, cover, count: count ?? null };
}
