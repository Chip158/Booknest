// The Bedtime Library app logic. Plain JS, no build step.
(function () {
  "use strict";

  const DATA = window.BEDTIME_DATA;
  const STATUSES = ["To listen", "Tonight", "Finished"];
  const STATUS_CLASS = { "To listen": "s-tolisten", "Tonight": "s-tonight", "Finished": "s-finished" };
  const KEYS = { status: "bedtime.status.v1", added: "bedtime.added.v1", filter: "bedtime.filter.v1" };

  // ---------- Storage (wrapped: private mode or blocked storage must not break the page) ----------

  function load(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignore */ }
  }

  const state = {
    statuses: load(KEYS.status, {}),
    added: Object.assign({ shows: [], episodes: [] }, load(KEYS.added, {})),
    filter: load(KEYS.filter, "ALL"),
    showFinished: false
  };

  // ---------- Helpers ----------

  const $ = (sel, root = document) => root.querySelector(sel);

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function slug(s) {
    return String(s).toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function safeUrl(u) {
    try {
      const url = new URL(u, location.href);
      return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
    } catch (e) {
      return "";
    }
  }

  function allShows() { return DATA.shows.concat(state.added.shows); }

  function showByKey(key) {
    return allShows().find(s => s.key === key) ||
      { key, name: key, short: key, icon: "🎧", color: "#3fa66a", art: null, link: "" };
  }

  function showLink(show) {
    return show.link || "https://open.spotify.com/search/" + encodeURIComponent(show.name) + "/podcasts";
  }

  function withIds(list, prefix) {
    return list.map(ep => Object.assign({ id: prefix + slug(ep.show + " " + ep.title) }, ep));
  }

  const builtInUpNext = withIds(DATA.upNext, "q-");
  const builtInFresh = withIds(DATA.freshDrops, "f-");

  function upNextEpisodes() {
    return builtInUpNext.concat(state.added.episodes.filter(e => e.list === "upnext"));
  }

  function freshEpisodes() {
    const list = builtInFresh.concat(state.added.episodes.filter(e => e.list === "fresh"));
    // Newest first; keep the original order for same-day releases.
    return list.map((e, i) => ({ e, i }))
      .sort((a, b) => (b.e.released || "").localeCompare(a.e.released || "") || a.i - b.i)
      .map(x => x.e);
  }

  function statusOf(id) { return state.statuses[id] || "To listen"; }

  function formatDate(iso) {
    if (!iso) return "";
    const d = new Date(iso + "T12:00:00");
    if (isNaN(d)) return "";
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }

  // ---------- Card markup ----------

  function artHtml(src, show, alt) {
    const url = src ? safeUrl(src) : "";
    if (!url) return `<div class="art-ph" role="img" aria-label="${esc(alt)}">${esc(show.icon || "🎧")}</div>`;
    return `<img class="art" src="${esc(url)}" alt="${esc(alt)}" loading="lazy" decoding="async" data-icon="${esc(show.icon || "🎧")}">`;
  }

  function showPill(show) {
    return `<span class="pill show-pill"><span aria-hidden="true">${esc(show.icon)}</span><span class="lbl">${esc(show.short || show.name)}</span></span>`;
  }

  function removeBtn(kind, id, label) {
    return `<button class="remove" type="button" data-remove="${kind}" data-id="${esc(id)}" aria-label="Remove ${esc(label)}">✕</button>`;
  }

  function episodeCard(ep, opts) {
    const show = showByKey(ep.show);
    const status = statusOf(ep.id);
    const art = ep.art || show.art;
    const metaBits = [];
    if (ep.length) metaBits.push(`<span class="len">${esc(ep.length)}</span>`);
    if (opts.showDate && ep.released) metaBits.push(`<span class="date">${esc(formatDate(ep.released))}</span>`);
    const cls = ["card", "ep"];
    if (status === "Tonight") cls.push("is-tonight");
    if (status === "Finished") cls.push("is-finished");
    return `
      <article class="${cls.join(" ")}" style="--c:${esc(show.color)}" data-id="${esc(ep.id)}">
        ${artHtml(art, show, show.name + " cover art")}
        ${ep.userAdded ? removeBtn("episode", ep.id, ep.title) : ""}
        <div class="card-body">
          <h3 class="title"><a class="stretch" href="${esc(safeUrl(ep.link))}" target="_blank" rel="noopener">${esc(ep.title)}</a></h3>
          <div class="meta">${showPill(show)}${metaBits.join("")}</div>
          <button class="pill status ${STATUS_CLASS[status]}" type="button" data-status="${esc(ep.id)}"
            aria-label="Status: ${esc(status)}. Tap to change.">${esc(status)}</button>
        </div>
      </article>`;
  }

  function showCard(show) {
    const badge = show.status
      ? `<span class="badge ${show.status === "Listening" ? "" : "start"}">${esc(show.status)}</span>`
      : "";
    return `
      <article class="card show" style="--c:${esc(show.color)}">
        ${artHtml(show.art, show, show.name + " cover art")}
        ${show.userAdded ? removeBtn("show", show.key, show.name) : ""}
        <div class="card-body">
          <h3 class="title"><a class="stretch" href="${esc(safeUrl(showLink(show)))}" target="_blank" rel="noopener">${esc(show.icon)} ${esc(show.name)}</a></h3>
          ${show.vibe ? `<p class="vibe">${esc(show.vibe)}</p>` : ""}
          ${badge}
        </div>
      </article>`;
  }

  // ---------- Renderers ----------

  function renderShelves() {
    const shows = allShows();
    const shelves = DATA.shelves.slice();
    shows.forEach(s => { if (s.shelf && !shelves.includes(s.shelf)) shelves.push(s.shelf); });
    $("#shelves").innerHTML = shelves.map(name => {
      const list = shows.filter(s => s.shelf === name);
      if (!list.length) return "";
      return `
        <div class="shelf">
          <h3 class="group-title">${esc(name)} <span class="n">${list.length}</span></h3>
          <div class="grid">${list.map(showCard).join("")}</div>
        </div>`;
    }).join("");
  }

  function renderChips() {
    const eps = upNextEpisodes().filter(e => state.showFinished || statusOf(e.id) !== "Finished");
    const keys = [];
    upNextEpisodes().forEach(e => { if (!keys.includes(e.show)) keys.push(e.show); });
    if (state.filter !== "ALL" && !keys.includes(state.filter)) state.filter = "ALL";

    const chip = (key, label, icon, color, n) => `
      <button class="chip" type="button" data-filter="${esc(key)}" aria-pressed="${state.filter === key}" style="--c:${esc(color)}">
        ${icon ? `<span aria-hidden="true">${esc(icon)}</span>` : ""}${esc(label)} <span class="n">${n}</span>
      </button>`;

    $("#chips").innerHTML = chip("ALL", "All", "", "#9fb3d6", eps.length) +
      keys.map(k => {
        const s = showByKey(k);
        return chip(k, s.short || s.name, s.icon, s.color, eps.filter(e => e.show === k).length);
      }).join("");
  }

  function renderQueue() {
    const all = upNextEpisodes();
    const finishedCount = all.filter(e => statusOf(e.id) === "Finished").length;
    const visible = all.filter(e =>
      (state.showFinished || statusOf(e.id) !== "Finished") &&
      (state.filter === "ALL" || e.show === state.filter));

    const keys = [];
    visible.forEach(e => { if (!keys.includes(e.show)) keys.push(e.show); });

    $("#queue").innerHTML = keys.length
      ? keys.map(k => {
          const show = showByKey(k);
          const eps = visible.filter(e => e.show === k);
          return `
            <div class="group" style="--c:${esc(show.color)}">
              <h3 class="group-title"><span class="dot"></span>${esc(show.icon)} ${esc(show.name)} <span class="n">${eps.length}</span></h3>
              <div class="grid">${eps.map(e => episodeCard(e, { showDate: false })).join("")}</div>
            </div>`;
        }).join("")
      : `<p class="empty">Nothing left here. Time to sleep 😴</p>`;

    const left = all.length - finishedCount;
    $("#upnextCount").textContent = left ? `${left} to go` : "";

    const toggle = $("#finishedToggle");
    toggle.hidden = finishedCount === 0;
    toggle.textContent = state.showFinished ? `Hide finished (${finishedCount})` : `Show finished (${finishedCount})`;
  }

  function renderFresh() {
    $("#freshGrid").innerHTML = freshEpisodes().map(e => episodeCard(e, { showDate: true })).join("");
  }

  function renderSummary() {
    const eps = upNextEpisodes().concat(freshEpisodes());
    const tonight = eps.filter(e => statusOf(e.id) === "Tonight").length;
    const queued = upNextEpisodes().filter(e => statusOf(e.id) === "To listen").length;
    $("#summary").textContent = (tonight ? `${tonight} for tonight · ` : "") + `${queued} in the queue`;
  }

  function renderUpNext() { renderChips(); renderQueue(); renderSummary(); }
  function renderAll() { renderShelves(); renderUpNext(); renderFresh(); fillSelects(); }

  // ---------- Status cycling ----------

  function setStatus(id, next) {
    if (next === "To listen") delete state.statuses[id];
    else state.statuses[id] = next;
    save(KEYS.status, state.statuses);
  }

  function cycleStatus(btn) {
    const id = btn.dataset.status;
    const next = STATUSES[(STATUSES.indexOf(statusOf(id)) + 1) % STATUSES.length];
    setStatus(id, next);

    // Update every card for this episode in place (no jump in scroll position).
    document.querySelectorAll(`[data-status="${CSS.escape(id)}"]`).forEach(b => {
      b.className = `pill status ${STATUS_CLASS[next]} pop`;
      b.textContent = next;
      b.setAttribute("aria-label", `Status: ${next}. Tap to change.`);
      const card = b.closest(".card");
      card.classList.toggle("is-tonight", next === "Tonight");
      card.classList.toggle("is-finished", next === "Finished");
    });

    const inQueue = btn.closest("#queue");
    if (next === "Finished" && inQueue && !state.showFinished) {
      const card = btn.closest(".card");
      card.classList.add("leaving");
      const done = () => { renderUpNext(); };
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setTimeout(done, reduce ? 0 : 650);
      toast("Finished ✓ Nice.");
    } else {
      renderChips();
      renderSummary();
      if (inQueue) renderQueueCountsOnly();
    }
  }

  function renderQueueCountsOnly() {
    const all = upNextEpisodes();
    const finishedCount = all.filter(e => statusOf(e.id) === "Finished").length;
    const left = all.length - finishedCount;
    $("#upnextCount").textContent = left ? `${left} to go` : "";
    const toggle = $("#finishedToggle");
    toggle.hidden = finishedCount === 0;
    toggle.textContent = state.showFinished ? `Hide finished (${finishedCount})` : `Show finished (${finishedCount})`;
  }

  // ---------- Toast ----------

  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 1800);
  }

  // ---------- Add form ----------

  const dialog = $("#addDialog");
  const form = $("#addForm");

  function fillSelects() {
    const showSel = $("#showSelect");
    const current = showSel.value;
    showSel.innerHTML = allShows().map(s => `<option value="${esc(s.key)}">${esc(s.icon)} ${esc(s.name)}</option>`).join("");
    if (current) showSel.value = current;
    const shelves = DATA.shelves.slice();
    allShows().forEach(s => { if (s.shelf && !shelves.includes(s.shelf)) shelves.push(s.shelf); });
    $("#shelfSelect").innerHTML = shelves.map(n => `<option>${esc(n)}</option>`).join("");
  }

  function currentKind() { return form.elements.kind.value; }

  function syncKind() {
    const kind = currentKind();
    form.querySelectorAll(".fields").forEach(el => { el.hidden = el.dataset.kind !== kind; });
    $("#imgHint").textContent = kind === "episode" ? "(optional, uses the show's art)" : "(optional, square works best)";
    $("#formError").textContent = "";
  }

  function openAdd() {
    form.reset();
    if (state.filter !== "ALL") form.elements.show.value = state.filter;
    syncKind();
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }

  function closeAdd() {
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  }

  function isHttpUrl(v) { return /^https?:\/\//i.test(v) && !!safeUrl(v); }

  function submitAdd(ev) {
    ev.preventDefault();
    const f = name => form.elements.namedItem(name);
    const err = $("#formError");
    const link = f("link").value.trim();
    const art = f("art").value.trim();

    if (!isHttpUrl(link)) { err.textContent = "Paste the Spotify link (starts with https://)."; f("link").focus(); return; }
    if (art && !isHttpUrl(art)) { err.textContent = "The image URL should start with https://."; f("art").focus(); return; }

    if (currentKind() === "episode") {
      const title = f("title").value.trim();
      if (!title) { err.textContent = "Give the episode a title."; f("title").focus(); return; }
      const list = f("list").value;
      const ep = {
        id: "u-" + Date.now().toString(36),
        show: f("show").value,
        title,
        length: f("length").value.trim() || null,
        link,
        art: art || null,
        list,
        userAdded: true
      };
      if (list === "fresh") ep.released = new Date().toISOString().slice(0, 10);
      state.added.episodes.push(ep);
      save(KEYS.added, state.added);
      closeAdd();
      renderUpNext();
      renderFresh();
      toast(list === "fresh" ? "Added to Fresh Drops" : "Added to Up Next");
      scrollToCard(ep.id);
    } else {
      const name = f("name").value.trim();
      if (!name) { err.textContent = "Give the show a name."; f("name").focus(); return; }
      let key = slug(name).toUpperCase().replace(/-/g, "").slice(0, 12) || "SHOW";
      while (allShows().some(s => s.key === key)) key += "2";
      const show = {
        key,
        name,
        short: name,
        icon: f("icon").value.trim() || "🎧",
        color: f("color").value,
        shelf: f("shelf").value,
        vibe: f("vibe").value.trim(),
        link,
        art: art || null,
        userAdded: true
      };
      state.added.shows.push(show);
      save(KEYS.added, state.added);
      closeAdd();
      renderAll();
      toast(`${show.name} is on the shelf`);
    }
  }

  function scrollToCard(id) {
    requestAnimationFrame(() => {
      const el = document.querySelector(`.card[data-id="${CSS.escape(id)}"]`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  function removeItem(kind, id) {
    if (kind === "episode") {
      const ep = state.added.episodes.find(e => e.id === id);
      if (!ep || !confirm(`Remove "${ep.title}"?`)) return;
      state.added.episodes = state.added.episodes.filter(e => e.id !== id);
      delete state.statuses[id];
      save(KEYS.status, state.statuses);
    } else {
      const show = state.added.shows.find(s => s.key === id);
      if (!show) return;
      const n = state.added.episodes.filter(e => e.show === id).length;
      if (!confirm(`Remove ${show.name}${n ? ` and its ${n} episode${n > 1 ? "s" : ""} you added` : ""}?`)) return;
      state.added.shows = state.added.shows.filter(s => s.key !== id);
      state.added.episodes = state.added.episodes.filter(e => e.show !== id);
    }
    save(KEYS.added, state.added);
    renderAll();
  }

  // ---------- Events ----------

  document.addEventListener("click", ev => {
    const status = ev.target.closest("[data-status]");
    if (status) { ev.preventDefault(); cycleStatus(status); return; }

    const rm = ev.target.closest("[data-remove]");
    if (rm) { ev.preventDefault(); removeItem(rm.dataset.remove, rm.dataset.id); return; }

    const chip = ev.target.closest("[data-filter]");
    if (chip) {
      state.filter = chip.dataset.filter;
      save(KEYS.filter, state.filter);
      renderChips();
      renderQueue();
      return;
    }
  });

  // Gentle press feedback on touch (iOS doesn't reliably fire :active without a touch listener).
  document.addEventListener("touchstart", ev => {
    if (ev.target.closest("[data-status], [data-remove]")) return;
    const card = ev.target.closest(".card");
    if (card) card.classList.add("pressed");
  }, { passive: true });
  ["touchend", "touchcancel", "touchmove"].forEach(t =>
    document.addEventListener(t, () => {
      document.querySelectorAll(".card.pressed").forEach(c => c.classList.remove("pressed"));
    }, { passive: true }));

  // Broken cover art: swap in the same-size placeholder tile.
  document.addEventListener("error", ev => {
    const img = ev.target;
    if (!(img instanceof HTMLImageElement) || !img.classList.contains("art")) return;
    const ph = document.createElement("div");
    ph.className = "art-ph";
    ph.setAttribute("role", "img");
    ph.setAttribute("aria-label", img.alt);
    ph.textContent = img.dataset.icon || "🎧";
    img.replaceWith(ph);
  }, true);

  $("#finishedToggle").addEventListener("click", () => {
    state.showFinished = !state.showFinished;
    renderUpNext();
  });

  $("#addBtn").addEventListener("click", openAdd);
  $("#closeAdd").addEventListener("click", closeAdd);
  form.addEventListener("change", ev => { if (ev.target.name === "kind") syncKind(); });
  form.addEventListener("submit", submitAdd);
  dialog.addEventListener("click", ev => { if (ev.target === dialog) closeAdd(); }); // tap outside to close

  renderAll();
})();
