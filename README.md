# 부동산 감정가 평가 시스템

AI 기반 부동산 감정가 평가 서비스입니다. OpenAI와 Claude를 활용하여 부동산의 입지, 주변 환경, 개발 계획 등을 종합적으로 분석하여 정확한 감정가를 산정합니다.

## 주요 기능

- 📍 **부동산 정보 입력**: 주소와 평형을 입력하여 분석 시작
- 🗺️ **입지 정보 수집**: 주변 교통, 교육, 의료, 편의시설 정보 수집
- 🤖 **AI 기반 분석**: OpenAI GPT-4와 Claude 3.5 Sonnet을 활용한 정밀 분석
- 📊 **종합 평가**: 입지, 접근성, 개발 잠재력 등 다각도 분석
- 💰 **감정가 산정**: 최소/평균/최대 예상 가격 및 평당 가격 제시
- ✅ **장단점 분석**: 해당 부동산의 강점과 약점 파악
- 📈 **시장 트렌드**: 현재 시장 동향 분석

## 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **AI APIs**: OpenAI GPT-4, Anthropic Claude 3.5
- **Map APIs**: 카카오맵, 네이버 지도 (선택사항)

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.example` 파일을 복사하여 `.env` 파일을 생성하고 API 키를 설정합니다:

```bash
cp .env.example .env
```

`.env` 파일을 열어 다음 정보를 입력합니다:

```env
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

#### API 키 발급 방법

**OpenAI API Key**
1. https://platform.openai.com/ 에 접속
2. 계정 생성 또는 로그인
3. API Keys 메뉴에서 새 키 생성
4. 생성된 키를 복사하여 `.env` 파일에 입력

**Anthropic API Key**
1. https://console.anthropic.com/ 에 접속
2. 계정 생성 또는 로그인
3. API Keys 메뉴에서 새 키 생성
4. 생성된 키를 복사하여 `.env` 파일에 입력

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 을 열어 확인합니다.

### 4. 프로덕션 빌드

```bash
npm run build
npm start
```

## 사용 방법

1. **주소 입력**: 평가하려는 부동산의 주소를 입력합니다.
   - 예: 서울특별시 강남구 역삼동 123-45

2. **평형 입력**: 부동산의 평형을 입력합니다.
   - 예: 32 (자동으로 제곱미터로 변환됩니다)

3. **AI 제공자 선택**:
   - **양쪽 모두**: OpenAI와 Claude의 분석을 모두 받습니다 (추천)
   - **OpenAI만**: OpenAI GPT-4의 분석만 받습니다
   - **Claude만**: Claude 3.5 Sonnet의 분석만 받습니다

4. **분석 결과 확인**:
   - 예상 감정가 (최소/평균/최대)
   - 평당 가격
   - 입지 점수, 접근성 점수, 개발 잠재력 점수
   - 장점 및 단점
   - 시장 트렌드
   - 상세 분석 내용

## 프로젝트 구조

```
apartgame/
├── app/
│   ├── api/
│   │   └── analyze/
│   │       └── route.ts          # 메인 분석 API 엔드포인트
│   ├── globals.css                # 전역 스타일
│   ├── layout.tsx                 # 루트 레이아웃
│   └── page.tsx                   # 메인 페이지
├── components/
│   ├── PropertyInputForm.tsx      # 부동산 입력 폼
│   └── ValuationResult.tsx        # 분석 결과 표시
├── lib/
│   ├── ai-analysis.ts             # AI 분석 로직
│   └── location.ts                # 입지 정보 수집
├── types/
│   └── index.ts                   # TypeScript 타입 정의
├── .env.example                   # 환경 변수 예시
├── package.json
├── tsconfig.json
└── README.md
```

## 주요 파일 설명

- **`app/api/analyze/route.ts`**: 부동산 분석 API 엔드포인트. 입지 정보 수집 및 AI 분석을 조율합니다.
- **`lib/ai-analysis.ts`**: OpenAI와 Claude API를 사용한 감정가 분석 로직
- **`lib/location.ts`**: 입지 정보 수집 (현재는 모의 데이터, 실제 API 연동 가능)
- **`components/PropertyInputForm.tsx`**: 사용자 입력 폼 컴포넌트
- **`components/ValuationResult.tsx`**: 분석 결과 표시 컴포넌트

## 실제 API 연동 (선택사항)

현재 입지 정보는 모의 데이터를 사용합니다. 실제 서비스에서는 다음 API를 연동할 수 있습니다:

### 카카오맵 API

`lib/location.ts` 파일에 주석으로 예시 코드가 포함되어 있습니다.

1. [카카오 개발자 센터](https://developers.kakao.com/)에서 앱 생성
2. REST API 키 발급
3. `.env` 파일에 `KAKAO_API_KEY` 추가
4. `lib/location.ts`의 주석 처리된 코드 활성화

### 공공데이터포털

- 지역 개발 계획
- 학교 정보
- 의료 시설 정보
- 교통 정보

[공공데이터포털](https://www.data.go.kr/)에서 관련 API를 신청하여 사용할 수 있습니다.

## 개발 가이드

### 새로운 AI 제공자 추가

1. `lib/ai-analysis.ts`에 새로운 분석 함수 추가
2. `app/api/analyze/route.ts`에 제공자 로직 추가
3. `types/index.ts`의 `aiProvider` 타입 확장

### UI 커스터마이징

Tailwind CSS를 사용하여 스타일을 쉽게 수정할 수 있습니다:
- `tailwind.config.ts`: 테마 설정
- `app/globals.css`: 전역 스타일
- 각 컴포넌트 파일에서 직접 스타일 수정

## 라이선스

MIT License

## 주의사항

⚠️ **이 프로젝트는 교육 및 데모 목적으로 제작되었습니다.**

- 실제 부동산 거래 시에는 반드시 공인된 감정평가사의 평가를 받으세요.
- AI의 분석 결과는 참고용이며, 실제 시장 가격과 차이가 있을 수 있습니다.
- OpenAI와 Anthropic API 사용 시 비용이 발생할 수 있습니다.
- 실제 입지 정보 수집을 위해서는 카카오맵, 네이버 지도 등의 API 연동이 필요합니다.

## 기여

버그 리포트, 기능 제안, Pull Request를 환영합니다!

## 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 등록해주세요.
