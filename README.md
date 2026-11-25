# 리뷰로 찾는 게임

스팀 한국어 리뷰를 바탕으로 게임을 추천해 주는 챗봇의 화면(프런트엔드)입니다.
HTML, CSS, JavaScript만 사용해서 따로 설치하거나 빌드할 것이 없습니다.

## 실행하기

`frontend/index.html` 파일을 브라우저로 열면 됩니다.

처음에는 **연습 모드**라서 서버 없이 가짜 답변이 나옵니다.
질문에 `없는게임`을 넣으면 근거가 부족할 때의 화면을 볼 수 있습니다.

## 실제 서버에 연결하기

`frontend/js/data.js` 맨 위의 두 줄을 바꿉니다.

```js
const API_BASE_URL = "https://api.example.com"; // 내 서버 주소 (끝에 / 없이)
const USE_MOCK = false;                         // 연습 모드 끄기
```

- 화면의 "서버 확인" 버튼으로 연결됐는지 확인할 수 있습니다.
- 서버 주소의 도메인이 화면과 다르면, 서버에서 접속을 허용(CORS)해야 합니다.
- 서버는 `POST /chat`(질문)과 `GET /health`(상태 확인)를 제공해야 합니다.

## 인터넷에 올리기 (AWS)

1. 파일을 S3에 올립니다.
   ```
   aws s3 sync frontend/ s3://<버킷명>/ --delete
   ```
   `--delete`는 버킷에만 있고 `frontend/`에는 없는 파일을 지웁니다.
2. CloudFront에 남은 이전 파일을 비웁니다.
   ```
   aws cloudfront create-invalidation --distribution-id <배포ID> --paths "/*"
   ```
