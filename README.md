# друг — 러시아어 친구 (개인용)

Claude API로 만든 러시아어 회화 연습 페이지. 매번 러시아어로 답하면 AI 친구가
자연스러운 원어민 표현으로 교정해줍니다.

## 파일 구조

```
russian-friend-app/
├── app/
│   ├── api/chat/route.ts   # Claude API 호출 (서버 전용, API 키 보호)
│   ├── layout.tsx          # 폰트 등 전역 레이아웃
│   ├── page.tsx            # 채팅 화면 (프론트엔드)
│   └── globals.css         # 스타일 (교정 카드 디자인 포함)
├── .env.local.example      # 환경변수 예시 (실제 키는 .env.local에)
├── .gitignore              # .env.local이 GitHub에 안 올라가게 함
├── package.json            # 의존성 목록
├── tailwind.config.ts      # 색상/폰트 커스텀 설정
└── tsconfig.json / next.config.js / postcss.config.js
```

## 1. 로컬에서 실행하기

```bash
# 1) 프로젝트 폴더로 이동 후 패키지 설치
npm install

# 2) 환경변수 파일 만들기
cp .env.local.example .env.local
# .env.local을 열어서 ANTHROPIC_API_KEY=sk-ant-... 부분에
# https://console.anthropic.com 에서 발급받은 실제 키를 넣기

# 3) 개발 서버 실행
npm run dev
```

브라우저에서 http://localhost:3000 접속하면 바로 사용 가능합니다.

## 2. GitHub에 올리기

이미 GitHub 계정이 있다는 가정하에:

```bash
# 프로젝트 폴더 안에서
git init
git add .
git commit -m "러시아어 친구 앱 초기 버전"

# GitHub에서 새 저장소를 만든 다음 (github.com -> New repository)
git remote add origin https://github.com/<내 아이디>/russian-friend-app.git
git branch -M main
git push -u origin main
```

`.env.local`은 `.gitignore`에 포함되어 있어서 **API 키는 절대 GitHub에 올라가지 않습니다.**
안심하고 push해도 됩니다.

## 3. 나중에 배포하고 싶어지면

- [Vercel](https://vercel.com)에 GitHub 저장소를 연결하면 자동으로 배포됩니다.
- 배포 시 Vercel 프로젝트 설정 > Environment Variables 에 `ANTHROPIC_API_KEY`를
  똑같이 등록해줘야 합니다 (로컬 .env.local과는 별개로 등록 필요).

## 4. 커스터마이징 포인트

- **시스템 프롬프트**: `app/api/chat/route.ts` 안의 `SYSTEM_PROMPT` 문자열을
  수정하면 AI 친구의 성격, 톤, 난이도 조절 방식을 바꿀 수 있습니다.
- **모델 변경**: 같은 파일의 `model: "claude-sonnet-5"` 부분에서 다른 모델로
  바꿀 수 있습니다 (예: 비용을 더 아끼고 싶으면 `claude-haiku-4-5-20251001`).
- **디자인**: `tailwind.config.ts`의 색상 값(`ai`, `user`, `surface` 등)과
  `app/globals.css`의 `.note-card` 스타일을 바꾸면 교정 카드의 느낌을 조절할 수 있습니다.
