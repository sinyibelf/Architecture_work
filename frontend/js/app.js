"use strict";

// ===== 상태 =====
const state = {
  filters: { preset: "all", min: null, max: null, genres: [], koreanOnly: false },
  messages: [],      // { role: "user"|"bot"|"warn"|"error", text, games }
  isLoading: false,
  panelOpen: false,
  activeGameId: null,
  panelGames: [],    // 패널 탭에 쓰는 게임 목록 (마지막으로 연 답변 기준)
};

const $ = (id) => document.getElementById(id);
const isMobile = () => matchMedia("(max-width: 768px)").matches;

// DOM 생성 헬퍼: 모든 텍스트는 textContent로만 넣는다
function el(tag, props = {}, children = []) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === "text") n.textContent = v;
    else if (k === "class") n.className = v;
    else n.setAttribute(k, v);
  }
  n.append(...children);
  return n;
}

// 스팀 도메인일 때만 링크 허용
function safeUrl(u) {
  return typeof u === "string" &&
    (u.startsWith("https://store.steampowered.com") || u.startsWith("https://steamcommunity.com")) ? u : null;
}
function extLink(url, label) {
  const href = safeUrl(url);
  if (!href) return null;
  return el("a", { class: "link", href, target: "_blank", rel: "noopener noreferrer", text: label });
}

function pickRandom(arr, n) {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
}
const circled = (n) => (n >= 1 && n <= 20 ? String.fromCharCode(0x2460 + n - 1) : `#${n}`);
const won = (g) => (g.isFree || g.price === 0 ? "무료" : `${Number(g.price).toLocaleString("ko-KR")}원`);

function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => (t.hidden = true), 4000);
}

// ===== 필터 =====
// 현재 필터에서 가격 범위 계산
function priceRange() {
  const f = state.filters;
  if (f.preset === "custom") return { min: f.min, max: f.max };
  const p = PRICE_PRESETS.find((x) => x.value === f.preset);
  return { min: p.min ?? null, max: p.max ?? null };
}
function priceInvalid() {
  const { min, max } = priceRange();
  return min !== null && max !== null && min > max;
}
// 요청에 넣을 필터 객체 (값이 없는 항목은 뺀다)
function requestFilters() {
  const { min, max } = priceRange();
  const out = {};
  if (min !== null) out.priceMin = min;
  if (max !== null) out.priceMax = max;
  if (state.filters.genres.length) out.genres = [...state.filters.genres];
  if (state.filters.koreanOnly) out.koreanOnly = true;
  return out;
}

function renderFilters() {
  const f = state.filters;
  $("price-custom").hidden = f.preset !== "custom";
  $("price-warn").hidden = !priceInvalid();

  // 장르 선택 칩
  const chips = $("genre-chips");
  chips.replaceChildren(...f.genres.map((g) => genreChip(g, true)));

  // 채팅 상단 "적용 중" 칩
  const { min, max } = priceRange();
  const parts = [];
  if (f.preset === "custom") {
    if (min !== null || max !== null) parts.push(`${min ?? 0}원 ~ ${max !== null ? max + "원" : ""}`);
  } else if (f.preset !== "all") {
    parts.push(PRICE_PRESETS.find((p) => p.value === f.preset).label);
  }
  parts.push(...f.genres);
  if (f.koreanOnly) parts.push("한국어 지원");
  const box = $("applied");
  box.replaceChildren();
  if (parts.length) {
    box.append(el("span", { text: "적용 중:" }), ...parts.map((p) => el("span", { class: "chip", text: p })));
  }
}

function genreChip(g) {
  const x = el("button", { class: "x", type: "button", "aria-label": `${g} 장르 빼기`, text: "✕" });
  x.addEventListener("click", () => {
    state.filters.genres = state.filters.genres.filter((v) => v !== g);
    renderFilters();
  });
  return el("span", { class: "chip" }, [document.createTextNode(g), x]);
}

function addGenre(g) {
  g = g.trim();
  if (g && !state.filters.genres.includes(g)) state.filters.genres.push(g);
  $("genre-input").value = "";
  renderGenreList();
  renderFilters();
}

// 장르 검색 목록
function renderGenreList() {
  const q = $("genre-input").value.trim().toLowerCase();
  const items = GENRES.filter((g) => !state.filters.genres.includes(g) && g.toLowerCase().includes(q));
  const list = $("genre-list");
  list.replaceChildren(...items.map((g) => {
    const b = el("button", { type: "button", role: "option", text: g });
    b.addEventListener("mousedown", (e) => e.preventDefault()); // 입력 포커스 유지
    b.addEventListener("click", () => addGenre(g));
    return el("li", { role: "presentation" }, [b]);
  }));
  const open = items.length > 0 && document.activeElement === $("genre-input");
  list.hidden = !open;
  $("genre-input").setAttribute("aria-expanded", String(open));
}

function resetFilters() {
  state.filters = { preset: "all", min: null, max: null, genres: [], koreanOnly: false };
  $("price-select").value = "all";
  $("price-min").value = "";
  $("price-max").value = "";
  $("korean-only").checked = false;
  renderFilters();
}

function bindFilters() {
  $("price-select").replaceChildren(...PRICE_PRESETS.map((p) => el("option", { value: p.value, text: p.label })));
  $("price-select").addEventListener("change", (e) => { state.filters.preset = e.target.value; renderFilters(); });
  const num = (v) => (v === "" ? null : Number(v));
  $("price-min").addEventListener("input", (e) => { state.filters.min = num(e.target.value); renderFilters(); });
  $("price-max").addEventListener("input", (e) => { state.filters.max = num(e.target.value); renderFilters(); });
  $("korean-only").addEventListener("change", (e) => { state.filters.koreanOnly = e.target.checked; renderFilters(); });
  $("btn-reset").addEventListener("click", resetFilters);

  const gi = $("genre-input");
  gi.addEventListener("input", renderGenreList);
  gi.addEventListener("focus", renderGenreList);
  gi.addEventListener("blur", () => { $("genre-list").hidden = true; gi.setAttribute("aria-expanded", "false"); });
  gi.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.isComposing) {
      e.preventDefault();
      const v = gi.value.trim();
      const hit = GENRES.find((g) => g.toLowerCase() === v.toLowerCase());
      if (hit) addGenre(hit);
      else if (v) toast("목록에 있는 장르만 선택할 수 있어요.");
    }
  });
}

// 모바일 필터 슬라이드 패널
function setFilterOpen(open) {
  $("filters").classList.toggle("open", open);
  $("btn-filter").setAttribute("aria-expanded", String(open));
  $("scrim").hidden = !(open || (state.panelOpen && isMobile()));
  if (open) $("btn-filter-close").focus();
}

// ===== 첫 화면 =====
function renderWelcome() {
  const w = $("welcome");
  const chips = el("div", { class: "chips" }, pickRandom(QUESTION_POOL, 4).map(chipButton));
  w.replaceChildren(
    el("h2", { text: pickRandom(TITLES, 1)[0] }),
    el("p", { text: "한국어 스팀 리뷰를 근거로 답하고, 근거 리뷰와 상점 링크를 같이 보여줘요." }),
    chips
  );
}
function chipButton(q) {
  const b = el("button", { class: "chip", type: "button", text: q });
  b.addEventListener("click", () => sendQuestion(q));
  return b;
}
function hideWelcome() {
  const w = $("welcome");
  if (w.hidden) return;
  w.classList.add("fade");
  setTimeout(() => (w.hidden = true), 250);
}
// 입력창 위 후보 질문 칩
function renderSuggestions(list) {
  $("suggest").replaceChildren(...list.map(chipButton));
}

// ===== 채팅 =====
// 메시지 1개를 화면에 추가
function renderMessage(msg) {
  let node;
  if (msg.role === "bot") {
    const paras = String(msg.text).split("\n").filter(Boolean).map((t) => el("p", { text: t }));
    node = el("div", { class: "msg bot" }, [...paras, renderGameCards(msg.games)]);
  } else {
    node = el("div", { class: "msg " + msg.role, text: msg.text });
  }
  $("messages").append(node);
  node.scrollIntoView({ block: "end", behavior: "smooth" });
  return node;
}

// 게임 카드 그리드
function renderGameCards(games) {
  const grid = el("div", { class: "cards" });
  for (const g of games) {
    const open = el("button", { class: "link", type: "button", text: "근거 리뷰 보기" });
    open.addEventListener("click", () => openPanel(games, g.appId));
    const links = el("div", { class: "links" }, [open, extLink(g.storeUrl, "스팀 상점")].filter(Boolean));
    grid.append(el("article", { class: "card" }, [
      el("h3", { text: g.name }),
      el("p", { text: won(g) }),
      el("span", { class: "badge " + (g.koreanSupported ? "ok" : "no"), text: g.koreanSupported ? "한국어 지원" : "한국어 미지원" }),
      el("p", { class: "counts" }, [
        document.createTextNode("추천 "), el("span", { class: "pos", text: String(g.positiveCount) }),
        document.createTextNode(" / 비추천 "), el("span", { class: "neg", text: String(g.negativeCount) }),
      ]),
      links,
    ]));
  }
  return grid;
}

// 질문 전송 전체 흐름
async function sendQuestion(text) {
  const question = String(text).trim();
  if (!question || state.isLoading) return;
  if (priceInvalid()) return toast("가격대를 확인해 주세요. 최소가 최대보다 커요.");

  hideWelcome();
  $("suggest").replaceChildren();
  $("input").value = "";
  $("input").style.height = "";
  setLoading(true);

  const user = { role: "user", text: question };
  state.messages.push(user);
  renderMessage(user);
  const loading = renderMessage({ role: "loading", text: "리뷰를 찾는 중..." });

  let reply;
  try {
    const data = await callApi(question);
    if (data.status === "insufficient" || !Array.isArray(data.games) || !data.games.length) {
      reply = { role: "warn", text: "관련 리뷰가 충분하지 않아 답변하기 어려워요. 조건을 넓히거나 질문을 바꿔 보세요." };
    } else {
      reply = { role: "bot", text: data.answer || "", games: data.games };
    }
    loading.remove();
    state.messages.push(reply);
    renderMessage(reply);
    const sug = Array.isArray(data.suggestions) && data.suggestions.length
      ? data.suggestions.slice(0, 3)
      : pickRandom(QUESTION_POOL, 3);
    renderSuggestions(sug);
  } catch (err) {
    loading.remove();
    reply = { role: "error", text: `오류가 발생했어요: ${err.name === "AbortError" ? "응답 시간이 15초를 넘었어요" : err.message}` };
    state.messages.push(reply);
    renderMessage(reply);
  } finally {
    setLoading(false);
    $("input").focus();
  }
}

function setLoading(on) {
  state.isLoading = on;
  $("input").disabled = on;
  $("btn-send").disabled = on;
}

// ===== API =====
// 15초 타임아웃이 걸린 fetch
async function fetchWithTimeout(url, opts = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...opts, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

// 채팅 API 호출 (목업이면 목업 사용)
async function callApi(question) {
  if (USE_MOCK) return mockApi(question);
  const res = await fetchWithTimeout(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, filters: requestFilters() }),
  });
  if (!res.ok) throw new Error(`서버 응답 오류 (${res.status})`);
  return res.json();
}

// 목업: 600ms 지연, "없는게임"이 들어가면 근거 부족 응답
function mockApi(question) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(structuredClone(question.includes("없는게임") ? MOCK_INSUFFICIENT : MOCK_OK)), 600);
  });
}

// 서버 확인 버튼
async function checkHealth() {
  const btn = $("btn-health");
  btn.disabled = true;
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/health`);
    if (!res.ok) throw new Error(`상태 코드 ${res.status}`);
    toast("서버 정상");
  } catch (err) {
    const why = err.name === "AbortError" ? "응답 시간 초과" : err.message;
    toast(`연결 실패: ${why} (CORS 설정 문제일 수도 있어요)`);
  } finally {
    btn.disabled = false;
  }
}

// ===== 근거 리뷰 패널 =====
function openPanel(games, appId) {
  if (games) state.panelGames = games;
  state.activeGameId = appId ?? state.panelGames[0]?.appId ?? null;
  state.panelOpen = true;
  renderEvidencePanel();
  if (isMobile()) $("scrim").hidden = false;
  $("btn-panel-close").focus();
}
function closePanel() {
  state.panelOpen = false;
  renderEvidencePanel();
  if (!$("filters").classList.contains("open")) $("scrim").hidden = true;
}

function renderEvidencePanel() {
  const panel = $("panel");
  panel.hidden = !state.panelOpen;
  $("btn-panel").setAttribute("aria-expanded", String(state.panelOpen));
  if (!state.panelOpen) return;

  const body = $("panel-body");
  const game = state.panelGames.find((g) => g.appId === state.activeGameId);
  if (!game) {
    body.replaceChildren(el("p", { class: "empty", text: "질문하면 근거 리뷰가 여기에 보여요." }));
    return;
  }
  const nodes = [];
  if (state.panelGames.length > 1) {
    const tabs = el("div", { class: "tabs", role: "tablist" });
    for (const g of state.panelGames) {
      const t = el("button", { class: "tab", type: "button", role: "tab", "aria-selected": String(g.appId === game.appId), text: g.name });
      t.addEventListener("click", () => { state.activeGameId = g.appId; renderEvidencePanel(); });
      tabs.append(t);
    }
    nodes.push(tabs);
  }
  nodes.push(el("div", { class: "panel-title" }, [
    el("h3", { text: game.name }),
    extLink(game.storeUrl, "스팀 상점"),
    el("span", { class: "badge ok", text: `추천 ${game.positiveCount}개` }),
    el("span", { class: "badge bad", text: `비추천 ${game.negativeCount}개` }),
  ].filter(Boolean)));
  const reviews = game.reviews || [];
  if (!reviews.length) nodes.push(el("p", { class: "empty", text: "표시할 리뷰가 없어요." }));
  nodes.push(...reviews.map(renderReview));
  body.replaceChildren(...nodes);
  body.scrollTop = 0;
}

function fmtDate(t) {
  const d = new Date(t < 1e12 ? t * 1000 : t);
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`;
}

// 리뷰 카드 1개 (추천/비추천은 색 + 아이콘 + 글자로 구분)
function renderReview(r) {
  const up = !!r.votedUp;
  const votes = [];
  if (r.votesUp != null) votes.push(`유용함 ${r.votesUp}`);
  if (r.votesFunny != null) votes.push(`재미있음 ${r.votesFunny}`);
  const hours = (r.playtimeAtReviewMin / 60).toFixed(1);
  return el("article", { class: "review " + (up ? "up" : "down") }, [
    el("div", { class: "review-top" }, [
      el("span", { class: up ? "pos" : "neg", text: up ? "👍 추천" : "👎 비추천" }),
    ]),
    el("p", { class: "review-meta", text: `플레이타임 ${hours}시간 / ${fmtDate(r.createdAt)}` }),
    el("p", { class: "review-text", text: r.excerpt }),
    votes.length ? el("p", { class: "review-votes", text: votes.join(" · ") }) : null,
    extLink(r.reviewUrl, "리뷰 원문"),
  ].filter(Boolean));
}

// ===== 초기화 =====
function init() {
  bindFilters();
  renderFilters();
  renderWelcome();

  $("form").addEventListener("submit", (e) => { e.preventDefault(); sendQuestion($("input").value); });
  $("input").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); sendQuestion($("input").value); }
  });
  $("input").addEventListener("input", (e) => {
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  });

  $("btn-panel").addEventListener("click", () => (state.panelOpen ? closePanel() : openPanel()));
  $("btn-panel-close").addEventListener("click", closePanel);
  $("btn-health").addEventListener("click", checkHealth);
  const fold = () => {
    const folded = $("filters").classList.toggle("folded");
    $("btn-filter-fold").setAttribute("aria-expanded", String(!folded));
  };
  $("btn-filter-fold").addEventListener("click", (e) => { e.stopPropagation(); fold(); });
  // 접힌 상태에서는 바 아무 곳이나 눌러도 펼쳐짐
  $("filters").addEventListener("click", () => { if ($("filters").classList.contains("folded")) fold(); });
  $("btn-filter").addEventListener("click", () => setFilterOpen(true));
  $("btn-filter-close").addEventListener("click", () => setFilterOpen(false));
  $("scrim").addEventListener("click", () => { setFilterOpen(false); if (state.panelOpen) closePanel(); });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (state.panelOpen) closePanel();
    if ($("filters").classList.contains("open")) setFilterOpen(false);
  });
}
init();
