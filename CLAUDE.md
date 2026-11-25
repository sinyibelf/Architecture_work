# 프로젝트 요약
스팀 한국어 리뷰 기반 RAG 게임 탐색 챗봇의 프런트엔드 (정적 사이트, 빌드 없음).

## 구조
- `frontend/index.html` — 레이아웃 (헤더 / 필터 / 채팅 / 근거 리뷰 패널). CSS → `js/data.js` → `js/app.js` 순서로 로드
- `frontend/css/style.css` — 맨 위 CSS 변수(스팀 느낌 팔레트). 모바일 기준 768px
- `frontend/js/data.js` — 설정(`API_BASE_URL`, `USE_MOCK`), 제목 문구, 질문 풀, 장르, 가격 프리셋, 목업 응답
- `frontend/js/app.js` — `state` 하나로 상태 관리, 역할별 함수(render*, sendQuestion, callApi, mockApi, checkHealth)

## 규칙
- 외부 데이터(게임명, 리뷰, 답변)는 `innerHTML` 금지. `textContent`/`createElement`(`el()` 헬퍼)만 사용
- 외부 링크는 `target="_blank" rel="noopener noreferrer"`, `safeUrl()`로 스팀 도메인(store.steampowered.com, steamcommunity.com)만 허용
- 목업의 게임명/리뷰는 `[게임명 A]` 같은 빈칸 표기. 실제 게임/리뷰를 지어내지 않는다
- 터치 대상 44px 이상, 대비 4.5:1, 색만으로 상태 구분 금지(아이콘/글자 병행), 아이콘 버튼엔 `aria-label`
- 로고/상표 사용 금지, 그라데이션 배경 금지
- API 형식: `POST /chat` 요청 `{question, filters}` → 응답 `{status, answer, games[], suggestions[]}`
