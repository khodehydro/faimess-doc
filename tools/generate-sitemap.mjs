import { writeFileSync } from "node:fs";

const SITE_URL = "https://faimess.app";
const TODAY = "2026-10-06";

const artists = ["ar1", "ar2", "ar3", "ar4", "ar5", "ar6", "ar7", "ar8"];
const albums = ["al1", "al2", "al3", "al4", "al5", "al6", "al7", "al8"];
const playlists = ["p1", "p2", "p3", "p4", "p5", "p6"];
const news = ["nw1", "nw2", "nw3", "nw4"];
const tracks = ["nt1", "nt2", "nt3", "nt4", "nt5", "nt6", "nt7", "tr1", "tr2", "tr3", "tr4", "tr5", "tr6"];

const entries = [
  // Core platform pages
  { loc: `${SITE_URL}/`, priority: "1.0", changefreq: "daily", lastmod: TODAY },
  { loc: `${SITE_URL}/#/artists`, priority: "0.9", changefreq: "weekly", lastmod: TODAY },
  { loc: `${SITE_URL}/#/albums`, priority: "0.9", changefreq: "weekly", lastmod: TODAY },
  { loc: `${SITE_URL}/#/playlists`, priority: "0.8", changefreq: "weekly", lastmod: TODAY },
  { loc: `${SITE_URL}/#/news`, priority: "0.9", changefreq: "daily", lastmod: TODAY },
  { loc: `${SITE_URL}/#/shop`, priority: "0.8", changefreq: "weekly", lastmod: TODAY },
  { loc: `${SITE_URL}/#/download`, priority: "0.7", changefreq: "monthly", lastmod: TODAY },
];

for (const id of artists) {
  entries.push({ loc: `${SITE_URL}/#/artist/${id}`, priority: "0.9", changefreq: "weekly", lastmod: TODAY });
}

for (const id of albums) {
  entries.push({ loc: `${SITE_URL}/#/album/${id}`, priority: "0.9", changefreq: "weekly", lastmod: TODAY });
}

for (const id of tracks) {
  entries.push({ loc: `${SITE_URL}/#/track/${id}`, priority: "0.8", changefreq: "weekly", lastmod: TODAY });
}

for (const id of playlists) {
  entries.push({ loc: `${SITE_URL}/#/playlist/${id}`, priority: "0.8", changefreq: "weekly", lastmod: TODAY });
}

for (const id of news) {
  entries.push({ loc: `${SITE_URL}/#/news/${id}`, priority: "0.8", changefreq: "weekly", lastmod: TODAY });
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries
  .map(
    (e) => `  <url>
    <loc>${e.loc}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${e.loc}?lang=en" />
    <xhtml:link rel="alternate" hreflang="fa" href="${e.loc}?lang=fa" />
    <xhtml:link rel="alternate" hreflang="ko" href="${e.loc}?lang=ko" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${e.loc}" />
  </url>`,
  )
  .join("\n")}
</urlset>
`;

writeFileSync("public/sitemap.xml", xml, "utf8");
console.log(`Successfully generated public/sitemap.xml with ${entries.length} URLs.`);
