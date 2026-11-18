// ===== 더미 데이터 (직접 수정하세요) =====
// 다음 주차에 DynamoDB로 옮길 때 이 구조(필드명)를 그대로 테이블 속성으로 쓴다.
// 날짜는 "YYYY-MM-DD" 형식 문자열.

// --- S01/S02 사이트 주인 정보 ---
const profile = {
  name: "이름을 적으세요",
  affiliation: "소속을 적으세요 (예: OO대학교 OO학과)",
  intro: "한 줄 소개를 적으세요",
  image: "images/profile.png",   // images/ 폴더에 넣은 파일명
  likes: ["선호 키워드1", "선호 키워드2"],
  dislikes: ["불호 키워드1", "불호 키워드2"],
};

// --- Persona (페르소나) : 3개 ---
const personas = [
  {
    id: "p1",
    name: "학부생",
    description: "페르소나 한 줄 설명을 적으세요",
    tags: ["학교", "공부"],
    createdAt: "2026-01-01",
  },
  {
    id: "p2",
    name: "자격증 준비생",
    description: "페르소나 한 줄 설명을 적으세요",
    tags: ["자격증", "공부"],
    createdAt: "2026-01-02",
  },
  {
    id: "p3",
    name: "디지털 드로잉 창작자",
    description: "페르소나 한 줄 설명을 적으세요",
    tags: ["그림", "취미"],
    createdAt: "2026-01-03",
  },
];

// --- Experience (경험 기록) : 5~6개 ---
// personaId는 위 personas의 id와 맞춰야 한다.
const experiences = [
  {
    id: "e1",
    personaId: "p1",
    title: "경험 기록 제목 1",
    tags: ["태그A"],
    createdAt: "2026-02-01",
    period: "2026-01 ~ 2026-02",   // 경험 기간
    situation: "상황: 어떤 상황이었는지 적으세요",
    attempt: "시도: 무엇을 해봤는지 적으세요",
    result: "결과: 어떻게 되었는지 적으세요",
    likes: 3,    // 공감 수
    views: 20,   // 조회수
  },
  {
    id: "e2",
    personaId: "p1",
    title: "경험 기록 제목 2",
    tags: ["태그B"],
    createdAt: "2026-02-10",
    period: "2026-02",
    situation: "상황을 적으세요",
    attempt: "시도를 적으세요",
    result: "결과를 적으세요",
    likes: 5,
    views: 35,
  },
  {
    id: "e3",
    personaId: "p2",
    title: "경험 기록 제목 3",
    tags: ["태그A"],
    createdAt: "2026-03-01",
    period: "2026-02 ~ 2026-03",
    situation: "상황을 적으세요",
    attempt: "시도를 적으세요",
    result: "결과를 적으세요",
    likes: 2,
    views: 15,
  },
  {
    id: "e4",
    personaId: "p2",
    title: "경험 기록 제목 4",
    tags: ["태그C"],
    createdAt: "2026-03-15",
    period: "2026-03",
    situation: "상황을 적으세요",
    attempt: "시도를 적으세요",
    result: "결과를 적으세요",
    likes: 7,
    views: 50,
  },
  {
    id: "e5",
    personaId: "p3",
    title: "경험 기록 제목 5",
    tags: ["태그D"],
    createdAt: "2026-04-01",
    period: "2026-03 ~ 2026-04",
    situation: "상황을 적으세요",
    attempt: "시도를 적으세요",
    result: "결과를 적으세요",
    likes: 4,
    views: 28,
  },
  {
    id: "e6",
    personaId: "p3",
    title: "경험 기록 제목 6",
    tags: ["태그D", "태그E"],
    createdAt: "2026-04-10",
    period: "2026-04",
    situation: "상황을 적으세요",
    attempt: "시도를 적으세요",
    result: "결과를 적으세요",
    likes: 6,
    views: 40,
  },
];

// --- Question (질문) : S06 질문함용 ---
// status: "답변대기" / "답변완료" / "숨김"  (S06에는 "답변완료"만 공개)
const questions = [
  {
    id: "q1",
    nickname: "방문자1",
    personaId: "p1",
    content: "질문 내용을 적으세요 (10자 이상)",
    answer: "답변 내용을 적으세요",
    status: "답변완료",
    createdAt: "2026-04-15",
  },
  {
    id: "q2",
    nickname: "방문자2",
    personaId: "p3",
    content: "아직 답변 안 한 질문 예시입니다",
    answer: "",
    status: "답변대기",
    createdAt: "2026-04-16",
  },
];
