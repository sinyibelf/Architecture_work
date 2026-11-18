// ===== 렌더링 로직 (data.js의 데이터를 화면에 그린다) =====

// --- 공통 도우미 ---

// 주소의 쿼리스트링 값 읽기 (예: persona.html?id=p1 -> getParam("id") === "p1")
function getParam(key) {
  return new URLSearchParams(location.search).get(key);
}

// id로 페르소나 찾기
function findPersona(id) {
  return personas.find((p) => p.id === id);
}

// 태그 배열 -> <span class="tag"> 묶음 HTML
function tagsHtml(tags) {
  return tags.map((t) => `<span class="tag">${t}</span>`).join("");
}

// 페르소나의 경험 기록 수
function countExperiences(personaId) {
  return experiences.filter((e) => e.personaId === personaId).length;
}

// 최신순 정렬 (원본은 건드리지 않음)
function sortByLatest(list) {
  return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// --- 공통 헤더/푸터 (모든 페이지에서 자동 삽입) ---
function renderLayout() {
  const links = [
    ["index.html", "Home"],
    ["about.html", "소개"],
    ["personas.html", "페르소나"],
    ["questions.html", "질문함"],
  ];
  document.getElementById("site-header").innerHTML = `
    <div class="container">
      <a class="site-logo" href="index.html">${profile.name}의 자기소개</a>
      <nav class="site-nav">
        ${links.map(([href, label]) => `<a href="${href}">${label}</a>`).join("")}
      </nav>
    </div>`;
}

// --- 카드 HTML 만들기 (여러 페이지에서 재사용) ---

// 페르소나 카드: 이름, 한 줄 설명, 기록 수, 태그
function personaCardHtml(p) {
  return `
    <a class="block" href="persona.html?id=${p.id}">
      <h3>${p.name}</h3>
      <p>${p.description}</p>
      <p class="meta">경험 기록 ${countExperiences(p.id)}개</p>
      ${tagsHtml(p.tags)}
    </a>`;
}

// 경험 기록 카드: 제목, 페르소나, 태그, 공감/조회수
function experienceCardHtml(e) {
  const persona = findPersona(e.personaId);
  return `
    <a class="block" href="experience.html?id=${e.id}">
      <h3>${e.title}</h3>
      <p class="meta">${persona ? persona.name : ""} / ${e.createdAt}</p>
      ${tagsHtml(e.tags)}
      <p class="meta">공감 ${e.likes} / 조회 ${e.views}</p>
    </a>`;
}

// --- 화면별 렌더링 ---

// S01 Home
function renderHome() {
  document.getElementById("home-intro").textContent = profile.intro;
  document.getElementById("home-image").src = profile.image;
  document.getElementById("home-personas").innerHTML = personas.map(personaCardHtml).join("");
  document.getElementById("home-recent").innerHTML =
    sortByLatest(experiences).slice(0, 3).map(experienceCardHtml).join("");
}

// S02 소개
function renderAbout() {
  document.getElementById("about-image").src = profile.image;
  document.getElementById("about-name").textContent = profile.name;
  document.getElementById("about-affiliation").textContent = profile.affiliation;
  document.getElementById("about-intro").textContent = profile.intro;
  document.getElementById("about-likes").innerHTML = tagsHtml(profile.likes);
  document.getElementById("about-dislikes").innerHTML = tagsHtml(profile.dislikes);
}

renderLayout();
