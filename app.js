const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const cfg = window.APP_CONFIG || {};
const TMDB_KEY = cfg.TMDB_API_KEY || "";
const TMDB_LANG = cfg.TMDB_LANG || "pt-BR";
const TMDB_REGION = cfg.TMDB_REGION || "BR";

const ALLOWED_EMBED_DOMAINS = cfg.ALLOWED_EMBED_DOMAINS || [];
const WATCH_ALLOWED_DOMAINS = cfg.WATCH_ALLOWED_DOMAINS || [];
const WATCH_OPTIONS = cfg.WATCH_OPTIONS || {};

const LS_KEY = "sr_movies_library_v3";

const state = {
  tab: "movie",
  library: loadLibrary(),
  currentMeta: null,   // { title, year, poster, kind, id }
  currentIsLibrary: false
};

function setSiteName(){
  const name = cfg.SITE_NAME || "SRIGAMER MOVIES";
  $("#siteName").textContent = name;
  document.title = name;
}
setSiteName();

function domainFromUrl(url){
  try{ return new URL(url).hostname; }catch{ return ""; }
}
function isAllowedDomain(url, allowList){
  const host = domainFromUrl(url);
  return !!host && allowList.includes(host);
}
function isAllowedEmbed(url){
  return isAllowedDomain(url, ALLOWED_EMBED_DOMAINS);
}

function tmdbUrl(path, params = {}) {
  const u = new URL("https://api.themoviedb.org/3" + path);
  u.searchParams.set("api_key", TMDB_KEY);
  u.searchParams.set("language", TMDB_LANG);
  u.searchParams.set("region", TMDB_REGION);
  Object.entries(params).forEach(([k,v]) => {
    if (v === undefined || v === null || v === "") return;
    u.searchParams.set(k, String(v));
  });
  return u.toString();
}

async function tmdbFetch(path, params){
  if (!TMDB_KEY || TMDB_KEY.includes("COLE_SUA")) {
    throw new Error("Configure sua TMDB_API_KEY no config.js (API Key v3).");
  }
  const res = await fetch(tmdbUrl(path, params));
  if (!res.ok) {
    const txt = await res.text().catch(()=> "");
    throw new Error("TMDb erro " + res.status + ": " + txt.slice(0,120));
  }
  return res.json();
}

async function anilistFetch(query, variables = {}) {
  const res = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify({ query, variables })
  });
  if (!res.ok) {
    const txt = await res.text().catch(()=> "");
    throw new Error("AniList erro " + res.status + ": " + txt.slice(0,120));
  }
  return res.json();
}

function imgTmdb(path, size="w342"){
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : "";
}
function safeText(s){
  return (s || "").toString().replace(/\s+/g, " ").trim();
}
function cleanHtmlToText(html){
  return (html || "")
    .toString()
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function setSectionTitle(){
  const map = {
    movie: "Em alta (Filmes)",
    tv: "Populares (Séries)",
    anime: "Em alta (Animes)",
    library: "Minha Biblioteca"
  };
  $("#sectionTitle").textContent = map[state.tab] || "Resultados";
}
function setHint(text){ $("#sectionHint").textContent = text || ""; }
function showAddButton(){ $("#addBtn").classList.toggle("hidden", state.tab !== "library"); }

function setActiveTab(tab){
  state.tab = tab;
  $$(".tab").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
  setSectionTitle();
  showAddButton();
  $("#searchInput").value = "";
  if (tab === "library") renderLibrary();
  else loadDefault();
}

/* Cards */
function cardTemplate({ id, title, year, poster, kind, raw, isLibrary }){
  const el = document.createElement("div");
  el.className = "card";

  const img = document.createElement("img");
  img.className = "poster";
  img.alt = title;
  img.loading = "lazy";
  img.src = poster || "";
  img.onerror = () => { img.src = ""; img.style.display="none"; };

  const body = document.createElement("div");
  body.className = "cardBody";
  body.innerHTML = `<div class="title"></div><div class="year"></div>`;
  body.querySelector(".title").textContent = title || "—";
  body.querySelector(".year").textContent = year || "—";

  el.appendChild(img);
  el.appendChild(body);

  el.addEventListener("click", () => openDetails(kind, id, raw, !!isLibrary));
  return el;
}
function renderGrid(items){
  const grid = $("#grid");
  grid.innerHTML = "";
  $("#empty").classList.toggle("hidden", items && items.length > 0);
  for (const it of items) grid.appendChild(cardTemplate(it));
}

/* Library */
function loadLibrary(){
  try{
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  }catch{ return []; }
}
function saveLibrary(){ localStorage.setItem(LS_KEY, JSON.stringify(state.library)); }
function addToLibrary(item){ state.library.unshift(item); saveLibrary(); }
function removeFromLibrary(id){ state.library = state.library.filter(x => x.id !== id); saveLibrary(); }

function renderLibrary(){
  setHint(`${state.library.length} itens salvos`);
  const items = state.library.map(x => ({
    kind: "library",
    isLibrary: true,
    id: x.id,
    title: x.title,
    year: x.year || "—",
    poster: x.poster || "",
    raw: x
  }));
  renderGrid(items);
}

/* Default */
async function loadDefault(){
  try{
    setHint("Carregando…");
    if (state.tab === "movie"){
      const data = await tmdbFetch("/trending/movie/week");
      const items = (data.results || []).slice(0, 24).map(x => ({
        kind: "movie", id: x.id, title: x.title,
        year: (x.release_date || "").slice(0,4),
        poster: imgTmdb(x.poster_path), raw: x
      }));
      renderGrid(items); setHint("Em alta na semana"); return;
    }
    if (state.tab === "tv"){
      const data = await tmdbFetch("/tv/popular");
      const items = (data.results || []).slice(0, 24).map(x => ({
        kind: "tv", id: x.id, title: x.name,
        year: (x.first_air_date || "").slice(0,4),
        poster: imgTmdb(x.poster_path), raw: x
      }));
      renderGrid(items); setHint("Populares agora"); return;
    }
    if (state.tab === "anime"){
      const query = `
        query {
          Page(page: 1, perPage: 24) {
            media(type: ANIME, sort: TRENDING_DESC) {
              id
              title { romaji english native }
              coverImage { large }
              seasonYear
              averageScore
              episodes
              format
              genres
              description
            }
          }
        }
      `;
      const data = await anilistFetch(query);
      const media = data?.data?.Page?.media || [];
      const items = media.map(a => ({
        kind: "anime", id: a.id,
        title: a.title?.romaji || a.title?.english || "Anime",
        year: a.seasonYear ? String(a.seasonYear) : "",
        poster: a.coverImage?.large || "", raw: a
      }));
      renderGrid(items); setHint("Em alta no momento"); return;
    }
  }catch(err){
    setHint("Erro: " + err.message);
    renderGrid([]);
  }
}

/* Search */
async function searchAll(q){
  const term = q.trim();
  if (!term) {
    if (state.tab === "library") renderLibrary();
    else loadDefault();
    return;
  }

  try{
    setHint("Buscando…");

    if (state.tab === "library"){
      const t = term.toLowerCase();
      const items = state.library
        .filter(x => (x.title || "").toLowerCase().includes(t))
        .map(x => ({
          kind: "library", isLibrary: true,
          id: x.id, title: x.title, year: x.year || "—",
          poster: x.poster || "", raw: x
        }));
      renderGrid(items);
      setHint(items.length ? `${items.length} resultados` : "Nenhum resultado");
      return;
    }

    if (state.tab === "anime"){
      const query = `
        query ($search: String) {
          Page(page: 1, perPage: 24) {
            media(type: ANIME, search: $search, sort: POPULARITY_DESC) {
              id
              title { romaji english native }
              coverImage { large }
              seasonYear
              averageScore
              episodes
              format
              genres
              description
            }
          }
        }
      `;
      const data = await anilistFetch(query, { search: term });
      const media = data?.data?.Page?.media || [];
      const items = media.map(a => ({
        kind: "anime", id: a.id,
        title: a.title?.romaji || a.title?.english || "Anime",
        year: a.seasonYear ? String(a.seasonYear) : "",
        poster: a.coverImage?.large || "", raw: a
      }));
      renderGrid(items);
      setHint(items.length ? `${items.length} resultados` : "Nenhum resultado");
      return;
    }

    if (state.tab === "movie"){
      const data = await tmdbFetch("/search/movie", { query: term, include_adult: "false", page: 1 });
      const items = (data.results || []).slice(0, 24).map(x => ({
        kind: "movie", id: x.id, title: x.title,
        year: (x.release_date || "").slice(0,4),
        poster: imgTmdb(x.poster_path), raw: x
      }));
      renderGrid(items);
      setHint(items.length ? `${items.length} resultados` : "Nenhum resultado");
      return;
    }

    if (state.tab === "tv"){
      const data = await tmdbFetch("/search/tv", { query: term, page: 1 });
      const items = (data.results || []).slice(0, 24).map(x => ({
        kind: "tv", id: x.id, title: x.name,
        year: (x.first_air_date || "").slice(0,4),
        poster: imgTmdb(x.poster_path), raw: x
      }));
      renderGrid(items);
      setHint(items.length ? `${items.length} resultados` : "Nenhum resultado");
      return;
    }

  }catch(err){
    setHint("Erro: " + err.message);
    renderGrid([]);
  }
}

/* Modal helpers */
function showModal(){
  $("#modal").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}
function hideModal(){
  $("#modal").classList.add("hidden");
  document.body.style.overflow = "";
  $("#trailerBox").innerHTML = "Sem trailer.";
  $("#relatedGrid").innerHTML = "";
  $("#watchBox").innerHTML = '<div class="watchHint">—</div>';
  $("#deleteBtn").classList.add("hidden");
  state.currentMeta = null;
  state.currentIsLibrary = false;
  $("#watchBtn").disabled = true;
  const v = $("#trailerBox").querySelector("video");
  if (v) { try{ v.pause(); v.src=""; }catch{} }
}
$("#modalClose").addEventListener("click", hideModal);
$("#modalX").addEventListener("click", hideModal);
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !$("#modal").classList.contains("hidden")) hideModal();
});

function pill(text){
  const s = document.createElement("span");
  s.className = "pill";
  s.textContent = text;
  return s;
}
function tag(text){
  const s = document.createElement("span");
  s.className = "tag";
  s.textContent = text;
  return s;
}
function makeBtn(label, href, primary=false){
  const a = document.createElement("a");
  a.className = "watchBtn" + (primary ? " primary" : "");
  a.href = href;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.textContent = label;
  return a;
}

function setWatchBox({ kind, id, officialLink, providersText }){
  const box = $("#watchBox");
  box.innerHTML = "";

  const row = document.createElement("div");
  row.className = "watchRow";

  if (officialLink){
    row.appendChild(makeBtn("Onde assistir (link oficial)", officialLink, true));
  }

  if (kind === "anime"){
    row.appendChild(makeBtn("Abrir no AniList", `https://anilist.co/anime/${id}`));
  }

  const title = state.currentMeta?.title || "";
  row.appendChild(makeBtn("YouTube (trailer)", `https://www.youtube.com/results?search_query=${encodeURIComponent("trailer " + title)}`));

  box.appendChild(row);

  const hint = document.createElement("div");
  hint.className = "watchHint";
  hint.textContent = providersText || (officialLink ? "Abra o link oficial para ver serviços no BR." : "Sem link oficial de provedores para BR.");
  box.appendChild(hint);

  const hint2 = document.createElement("div");
  hint2.className = "watchHint";
  hint2.textContent = "Clique em “Assistir” (no topo) para abrir suas opções configuradas no config.js.";
  box.appendChild(hint2);
}

function buildAssistOptions(kind, title){
  const q = encodeURIComponent(title || "");
  const opts = Array.isArray(WATCH_OPTIONS?.[kind]) ? WATCH_OPTIONS[kind] : [];
  const items = [];
  for (const o of opts){
    if (!o?.url || !o?.label) continue;
    const url = o.url.replaceAll("{q}", q);
    if (!isAllowedDomain(url, WATCH_ALLOWED_DOMAINS)) continue;
    items.push({ label: o.label, url });
  }
  return items;
}

function openAssistChooser(){
  if (!state.currentMeta || state.currentIsLibrary) return;
  const { title, kind } = state.currentMeta;
  const box = $("#watchBox");

  const old = box.querySelector("[data-chooser]");
  if (old) { old.remove(); return; } // toggle

  const chooser = document.createElement("div");
  chooser.dataset.chooser = "1";

  const items = buildAssistOptions(kind, title);
  if (!items.length){
    const hint = document.createElement("div");
    hint.className = "watchHint";
    hint.textContent = "Sem opções (ou domínio bloqueado). Edite WATCH_OPTIONS e WATCH_ALLOWED_DOMAINS no config.js.";
    chooser.appendChild(hint);
  } else {
    const row = document.createElement("div");
    row.className = "watchRow";
    items.forEach(it => row.appendChild(makeBtn(it.label, it.url)));
    chooser.appendChild(row);
  }

  box.appendChild(chooser);
}
$("#watchBtn").addEventListener("click", openAssistChooser);

/* Trailer helper */
function setTrailerFromTmdb(videos){
  const yt = (videos || []).find(v => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")) ||
             (videos || []).find(v => v.site === "YouTube");
  if (!yt?.key){
    $("#trailerBox").innerHTML = "Sem trailer disponível.";
    return;
  }
  $("#trailerBox").innerHTML = `<iframe src="https://www.youtube.com/embed/${yt.key}" allowfullscreen title="Trailer"></iframe>`;
}

/* Related helper */
function renderRelated(items){
  const grid = $("#relatedGrid");
  grid.innerHTML = "";
  items.forEach(it => grid.appendChild(cardTemplate(it)));
}

/* Player from library */
function setPlayerFromLibrary(item){
  $("#deleteBtn").classList.remove("hidden");
  $("#deleteBtn").onclick = () => {
    removeFromLibrary(item.id);
    hideModal();
    if (state.tab === "library") renderLibrary();
  };

  const type = (item.type || "mp4").toLowerCase();
  const url = (item.url || "").trim();

  if (!url){
    $("#trailerBox").innerHTML = "Sem URL configurada.";
    return;
  }

  if (type === "embed"){
    if (!isAllowedEmbed(url)){
      $("#trailerBox").innerHTML = "Embed bloqueado (config.js > ALLOWED_EMBED_DOMAINS).";
      return;
    }
    $("#trailerBox").innerHTML = `<iframe src="${url}" allowfullscreen title="Player"></iframe>`;
    return;
  }

  if (type === "hls" || url.endsWith(".m3u8")){
    const vidId = "v_" + Math.random().toString(16).slice(2);
    $("#trailerBox").innerHTML = `<video id="${vidId}" controls autoplay playsinline></video>`;
    const video = document.getElementById(vidId);
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
    } else if (window.Hls) {
      const hls = new Hls({ enableWorker: true });
      hls.loadSource(url);
      hls.attachMedia(video);
    } else {
      $("#trailerBox").innerHTML = "HLS não suportado (hls.js não carregou).";
    }
    return;
  }

  $("#trailerBox").innerHTML = `<video controls autoplay playsinline src="${url}"></video>`;
}

/* Details */
async function openDetails(kind, id, raw, isLibrary=false){
  try{
    $("#modalTitle").textContent = "Carregando…";
    $("#modalOverview").textContent = "";
    $("#modalMeta").innerHTML = "";
    $("#modalGenres").innerHTML = "";
    $("#modalPoster").src = "";
    $("#relatedGrid").innerHTML = "";
    $("#trailerBox").innerHTML = "Carregando…";
    $("#watchBox").innerHTML = '<div class="watchHint">Carregando…</div>';
    $("#deleteBtn").classList.add("hidden");
    $("#watchBtn").disabled = true;

    showModal();

    // Library item
    if (isLibrary || kind === "library"){
      const item = state.library.find(x => x.id === id);
      if (!item) throw new Error("Item não encontrado na biblioteca.");

      state.currentIsLibrary = true;
      state.currentMeta = { title: item.title, year: item.year, poster: item.poster, kind: "library", id };

      $("#modalTitle").textContent = item.title || "—";
      $("#modalPoster").src = item.poster || "";
      $("#modalOverview").textContent = "Item da sua biblioteca (link salvo por você).";

      const meta = $("#modalMeta");
      meta.appendChild(pill(item.year || "—"));
      meta.appendChild(pill((item.type || "mp4").toUpperCase()));

      setWatchBox({ kind: "library", id, officialLink: null, providersText: "Biblioteca pessoal." });
      $("#quickAddBtn").classList.add("hidden");
      setPlayerFromLibrary(item);
      return;
    }

    // Catalog item
    state.currentIsLibrary = false;
    $("#quickAddBtn").classList.remove("hidden");

    if (kind === "anime"){
      const query = `
        query ($id: Int) {
          Media(id: $id, type: ANIME) {
            id
            title { romaji english native }
            coverImage { large }
            seasonYear
            averageScore
            episodes
            format
            genres
            description
          }
        }
      `;
      const data = await anilistFetch(query, { id: Number(id) });
      const a = data?.data?.Media;

      const title = a?.title?.romaji || a?.title?.english || "Anime";
      const year = a?.seasonYear ? String(a.seasonYear) : "";
      const poster = a?.coverImage?.large || "";

      state.currentMeta = { title, year, poster, kind: "anime", id };

      $("#modalTitle").textContent = title;
      $("#modalPoster").src = poster;
      $("#modalOverview").textContent = a?.description ? cleanHtmlToText(a.description) : "Sem descrição.";

      const meta = $("#modalMeta");
      meta.appendChild(pill(year || "—"));
      meta.appendChild(pill(a?.averageScore ? `Nota: ${a.averageScore}/100` : "Nota: —"));
      meta.appendChild(pill(a?.episodes ? `EPs: ${a.episodes}` : "EPs: —"));
      meta.appendChild(pill(a?.format || "—"));

      const g = $("#modalGenres");
      (a?.genres || []).slice(0, 12).forEach(x => g.appendChild(tag(x)));

      setWatchBox({ kind: "anime", id, officialLink: null, providersText: "Use “Assistir” para abrir suas opções de anime (config.js)." });
      $("#trailerBox").innerHTML = "Trailer: use o botão do YouTube.";
      $("#watchBtn").disabled = false;

      // relacionados simples
      const term = (title || "").split(" ").slice(0, 2).join(" ");
      if (term){
        const sQuery = `
          query ($search: String) {
            Page(page: 1, perPage: 12) {
              media(type: ANIME, search: $search, sort: POPULARITY_DESC) {
                id
                title { romaji english native }
                coverImage { large }
                seasonYear
              }
            }
          }
        `;
        const s = await anilistFetch(sQuery, { search: term });
        const rel = (s?.data?.Page?.media || []).filter(x => String(x.id) !== String(id)).slice(0, 12);
        const items = rel.map(x => ({
          kind: "anime",
          id: x.id,
          title: x.title?.romaji || x.title?.english || "Anime",
          year: x.seasonYear ? String(x.seasonYear) : "",
          poster: x.coverImage?.large || "",
          raw: x
        }));
        renderRelated(items);
      }
      return;
    }

    if (kind === "movie"){
      const [d, vids, sim, prov] = await Promise.all([
        tmdbFetch(`/movie/${id}`),
        tmdbFetch(`/movie/${id}/videos`),
        tmdbFetch(`/movie/${id}/similar`, { page: 1 }),
        tmdbFetch(`/movie/${id}/watch/providers`)
      ]);

      const title = d?.title || "Filme";
      const year = (d?.release_date || "").slice(0,4) || "";
      const poster = d?.poster_path ? imgTmdb(d.poster_path, "w500") : "";

      state.currentMeta = { title, year, poster, kind: "movie", id };

      $("#modalTitle").textContent = title;
      $("#modalPoster").src = poster;
      $("#modalOverview").textContent = d?.overview ? safeText(d.overview) : "Sem sinopse.";

      const meta = $("#modalMeta");
      meta.appendChild(pill(year || "—"));
      meta.appendChild(pill(d?.vote_average ? `Nota: ${d.vote_average.toFixed(1)}` : "Nota: —"));
      meta.appendChild(pill(d?.runtime ? `${d.runtime} min` : "—"));

      const gg = $("#modalGenres");
      (d?.genres || []).slice(0, 12).forEach(x => gg.appendChild(tag(x.name)));

      setTrailerFromTmdb(vids?.results || []);

      const br = prov?.results?.[TMDB_REGION];
      const officialLink = br?.link || null;
      setWatchBox({ kind: "movie", id, officialLink, providersText: officialLink ? "Link oficial de provedores disponível." : "Sem link oficial de provedores." });
      $("#watchBtn").disabled = false;

      const items = (sim?.results || []).slice(0, 12).map(x => ({
        kind: "movie", id: x.id, title: x.title,
        year: (x.release_date || "").slice(0,4),
        poster: imgTmdb(x.poster_path), raw: x
      }));
      renderRelated(items);
      return;
    }

    if (kind === "tv"){
      const [d, vids, sim, prov] = await Promise.all([
        tmdbFetch(`/tv/${id}`),
        tmdbFetch(`/tv/${id}/videos`),
        tmdbFetch(`/tv/${id}/similar`, { page: 1 }),
        tmdbFetch(`/tv/${id}/watch/providers`)
      ]);

      const title = d?.name || "Série";
      const year = (d?.first_air_date || "").slice(0,4) || "";
      const poster = d?.poster_path ? imgTmdb(d.poster_path, "w500") : "";

      state.currentMeta = { title, year, poster, kind: "tv", id };

      $("#modalTitle").textContent = title;
      $("#modalPoster").src = poster;
      $("#modalOverview").textContent = d?.overview ? safeText(d.overview) : "Sem sinopse.";

      const meta = $("#modalMeta");
      meta.appendChild(pill(year || "—"));
      meta.appendChild(pill(d?.vote_average ? `Nota: ${d.vote_average.toFixed(1)}` : "Nota: —"));
      meta.appendChild(pill(d?.number_of_seasons ? `Temporadas: ${d.number_of_seasons}` : "Temporadas: —"));

      const gg = $("#modalGenres");
      (d?.genres || []).slice(0, 12).forEach(x => gg.appendChild(tag(x.name)));

      setTrailerFromTmdb(vids?.results || []);

      const br = prov?.results?.[TMDB_REGION];
      const officialLink = br?.link || null;
      setWatchBox({ kind: "tv", id, officialLink, providersText: officialLink ? "Link oficial de provedores disponível." : "Sem link oficial de provedores." });
      $("#watchBtn").disabled = false;

      const items = (sim?.results || []).slice(0, 12).map(x => ({
        kind: "tv", id: x.id, title: x.name,
        year: (x.first_air_date || "").slice(0,4),
        poster: imgTmdb(x.poster_path), raw: x
      }));
      renderRelated(items);
      return;
    }

  }catch(err){
    $("#modalTitle").textContent = "Erro: " + err.message;
    $("#trailerBox").innerHTML = "—";
    $("#watchBox").innerHTML = `<div class="watchHint">Erro: ${err.message}</div>`;
    $("#watchBtn").disabled = true;
  }
}

/* Add modal */
function showAddModal(){ $("#addModal").classList.remove("hidden"); document.body.style.overflow = "hidden"; }
function hideAddModal(){ $("#addModal").classList.add("hidden"); document.body.style.overflow = ""; }
$("#addClose").addEventListener("click", hideAddModal);
$("#addX").addEventListener("click", hideAddModal);

function openAddWithMeta(meta){
  const m = meta || state.currentMeta || { title:"", year:"", poster:"" };
  $("#fTitle").value = m.title || "";
  $("#fYear").value = m.year || "";
  $("#fPoster").value = m.poster || "";
  $("#fType").value = "mp4";
  $("#fUrl").value = "";
  showAddModal();
}
$("#addBtn").addEventListener("click", () => openAddWithMeta(null));
$("#quickAddBtn").addEventListener("click", () => {
  if (!state.currentMeta) return alert("Abra um título primeiro.");
  openAddWithMeta(state.currentMeta);
});

$("#saveBtn").addEventListener("click", () => {
  const title = $("#fTitle").value.trim();
  const year = $("#fYear").value.trim();
  const poster = $("#fPoster").value.trim();
  const type = $("#fType").value.trim();
  const url = $("#fUrl").value.trim();

  if (!title) return alert("Coloca um título.");
  if (!url) return alert("Coloca a URL.");

  if (type === "embed" && !isAllowedEmbed(url)){
    return alert("Embed bloqueado (config.js > ALLOWED_EMBED_DOMAINS).");
  }

  addToLibrary({ id: "lib_" + Date.now().toString(16), title, year, poster, type, url });
  hideAddModal();
  if (state.tab === "library") renderLibrary();
  alert("Salvo na sua Biblioteca!");
});

$("#exportBtn").addEventListener("click", async () => {
  const data = JSON.stringify(state.library, null, 2);
  try{ await navigator.clipboard.writeText(data); }catch{}
  alert("Biblioteca copiada pro clipboard (JSON).");
});
$("#importBtn").addEventListener("click", () => {
  const txt = prompt("Cole aqui o JSON da biblioteca:");
  if (!txt) return;
  try{
    const arr = JSON.parse(txt);
    if (!Array.isArray(arr)) throw new Error("JSON não é uma lista.");
    state.library = arr;
    saveLibrary();
    alert("Importado!");
    if (state.tab === "library") renderLibrary();
  }catch(e){
    alert("Erro ao importar: " + e.message);
  }
});

/* Search events */
$("#searchBtn").addEventListener("click", () => searchAll($("#searchInput").value));
$("#searchInput").addEventListener("keydown", (e) => { if (e.key === "Enter") searchAll($("#searchInput").value); });
$("#brand").addEventListener("click", (e) => {
  e.preventDefault();
  if (state.tab === "library") renderLibrary();
  else loadDefault();
});
$$(".tab").forEach(b => b.addEventListener("click", () => setActiveTab(b.dataset.tab)));

// init
setSectionTitle();
showAddButton();
loadDefault();
