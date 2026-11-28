// 설정값
const API_BASE_URL = "https://94efny5s0c.execute-api.ap-northeast-2.amazonaws.com";
const USE_MOCK = false;
const REQUEST_TIMEOUT_MS = 25000;

// 첫 화면 제목 문구
const TITLES = [
  "어떤 게임을 찾고 있나요?",
  "오늘은 어떤 게임이 끌리나요?",
  "리뷰로 다음 게임을 골라볼까요?",
];

// 후보 질문 풀
const QUESTION_POOL = [
  "혼자 해도 재밌는 협동 게임",
  "스토리가 좋은 2만 원 이하 게임",
  "조작이 쉬운 힐링 게임",
  "짧게 즐길 수 있는 로그라이크",
  "친구랑 같이 하기 좋은 파티 게임",
  "한국어 지원이 잘 된 어드벤처 게임",
  "최적화가 좋은 인디 게임",
  "퍼즐이 재밌는 게임",
];

const GENRES = ["액션", "어드벤처", "RPG", "시뮬레이션", "전략", "인디", "캐주얼", "스포츠", "레이싱"];

// 가격 프리셋: min/max는 원 단위
const PRICE_PRESETS = [
  { value: "all", label: "전체" },
  { value: "free", label: "무료", min: 0, max: 0 },
  { value: "10000", label: "1만 원 이하", max: 10000 },
  { value: "20000", label: "2만 원 이하", max: 20000 },
  { value: "30000", label: "3만 원 이하", max: 30000 },
  { value: "custom", label: "직접 입력" },
];

// 목업 응답 (게임명/리뷰는 빈칸 표기)
function mockReview(refNo, votedUp) {
  return {
    refNo, votedUp,
    playtimeAtReviewMin: 90 * refNo,
    createdAt: 1700000000 + refNo * 86400,
    excerpt: "[리뷰 발췌]",
    votesUp: votedUp ? 12 * refNo : null,
    votesFunny: refNo === 2 ? 3 : null,
    reviewUrl: "https://steamcommunity.com/",
  };
}
const MOCK_OK = {
  status: "ok",
  answer: "① [게임명 A]는 [근거 요약]\n② [게임명 B]는 [근거 요약]\n③ [게임명 C]는 [근거 요약]",
  games: [
    { appId: 1, name: "[게임명 A]", price: 15000, isFree: false, koreanSupported: true,
      storeUrl: "https://store.steampowered.com/", positiveCount: 120, negativeCount: 8,
      reviews: [mockReview(1, true), mockReview(2, false)] },
    { appId: 2, name: "[게임명 B]", price: 0, isFree: true, koreanSupported: true,
      storeUrl: "https://store.steampowered.com/", positiveCount: 80, negativeCount: 20,
      reviews: [mockReview(3, true)] },
    { appId: 3, name: "[게임명 C]", price: 19800, isFree: false, koreanSupported: false,
      storeUrl: "https://store.steampowered.com/", positiveCount: 45, negativeCount: 5,
      reviews: [mockReview(4, true), mockReview(5, true)] },
  ],
  suggestions: ["[후속 질문 1]", "[후속 질문 2]"],
};
const MOCK_INSUFFICIENT = { status: "insufficient", answer: "", games: [], suggestions: [] };
