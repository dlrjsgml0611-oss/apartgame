# 부동산 감정가 평가 시스템

AI 기반 부동산 감정가 평가 서비스입니다. OpenAI GPT-4와 Claude 3.5 Sonnet을 활용하여 부동산의 입지, 주변 환경, 실거래가, 개발 계획 등을 종합적으로 분석하여 정확한 감정가를 산정합니다.

## 주요 기능

- 📍 **부동산 정보 입력**: 주소와 전용면적(㎡)을 입력하여 분석 시작
- 🗺️ **실제 입지 정보 수집**:
  - 카카오맵 API를 통한 주소→좌표 변환
  - 주변 지하철역, 학교, 병원, 대형마트, 공원 실시간 검색
  - 거리 기반 정확한 입지 분석
- 💰 **실거래가 데이터**: 공공데이터포털 API 연동 (선택사항)
- 🤖 **AI 기반 분석**: OpenAI GPT-4와 Claude 3.5 Sonnet 정밀 분석
- 📊 **종합 평가**: 입지, 접근성, 개발 잠재력 등 다각도 분석
- 💵 **감정가 산정**: 최소/평균/최대 예상 가격 및 ㎡당 가격 제시
- ✅ **장단점 분석**: 해당 부동산의 강점과 약점 파악
- 📈 **시장 트렌드**: 현재 시장 동향 분석

## 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **AI APIs**: OpenAI GPT-4o, Anthropic Claude 3.5 Sonnet
- **Location APIs**:
  - 카카오맵 REST API (주소 검색, 주변 시설)
  - 공공데이터포털 API (아파트 실거래가)

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
# 필수 API 키
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
KAKAO_API_KEY=your_kakao_api_key_here

# 선택사항 (실거래가 정보)
PUBLIC_DATA_API_KEY=your_public_data_api_key_here
```

#### API 키 발급 방법

**1. OpenAI API Key (필수)**
1. https://platform.openai.com/ 에 접속
2. 계정 생성 또는 로그인
3. API Keys 메뉴에서 새 키 생성
4. 생성된 키를 복사하여 `.env` 파일에 입력

**2. Anthropic API Key (필수)**
1. https://console.anthropic.com/ 에 접속
2. 계정 생성 또는 로그인
3. API Keys 메뉴에서 새 키 생성
4. 생성된 키를 복사하여 `.env` 파일에 입력

**3. 카카오맵 REST API Key (필수)**
1. https://developers.kakao.com/ 에 접속
2. 계정 생성 또는 로그인
3. "내 애플리케이션" > "애플리케이션 추가하기"
4. 앱 생성 후 "REST API 키" 복사
5. "플랫폼" 탭에서 Web 플랫폼 추가 (http://localhost:3000)
6. `.env` 파일에 REST API 키 입력

**4. 공공데이터포털 API Key (선택사항)**
1. https://www.data.go.kr/ 에 접속
2. 회원가입 및 로그인
3. "아파트매매 실거래 상세 자료" 검색
4. 활용신청 > 승인 대기 (보통 1-2시간 소요)
5. 승인 후 "마이페이지" > "오픈API" > "일반 인증키(Encoding)" 복사
6. `.env` 파일에 입력

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
   - 상세 주소까지 입력하면 더 정확한 분석이 가능합니다

2. **전용면적 입력**: 부동산의 전용면적을 제곱미터(㎡) 단위로 입력합니다.
   - 예: 84.50 (자동으로 평형으로도 변환됩니다)
   - 분양광고나 등기부등본에서 확인 가능

3. **AI 제공자 선택**:
   - **양쪽 모두**: OpenAI와 Claude의 분석을 모두 받습니다 (추천)
   - **OpenAI만**: OpenAI GPT-4의 분석만 받습니다
   - **Claude만**: Claude 3.5 Sonnet의 분석만 받습니다

4. **분석 결과 확인**:
   - **부동산 정보**: 주소, 전용면적, 지역
   - **주변 시설**:
     - 지하철역 (거리, 호선)
     - 학교 (초/중/고, 거리)
     - 병원 (거리)
     - 대형마트 (거리)
     - 근린공원 (거리)
   - **예상 감정가**: 최소/평균/최대
   - **㎡당 가격**: 최소/평균/최대
   - **종합 점수**: 입지, 접근성, 개발 잠재력, 종합
   - **장점 및 단점**: 구체적인 분석
   - **시장 트렌드**: 현재 시장 동향
   - **상세 분석**: AI의 종합적인 평가

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
│   ├── ai-analysis.ts             # AI 분석 로직 (OpenAI, Claude)
│   └── location.ts                # 입지 정보 수집 (카카오맵, 공공데이터)
├── types/
│   └── index.ts                   # TypeScript 타입 정의
├── .env.example                   # 환경 변수 예시
├── package.json
├── tsconfig.json
└── README.md
```

## 주요 파일 설명

### API 엔드포인트
- **`app/api/analyze/route.ts`**: 부동산 분석 API 엔드포인트. 입력 검증, 입지 정보 수집, AI 분석을 조율합니다.

### 라이브러리
- **`lib/location.ts`**:
  - 카카오맵 API를 사용한 주소→좌표 변환
  - 카테고리별 주변 시설 검색 (지하철역, 학교, 병원, 마트, 공원)
  - 공공데이터포털 API를 통한 실거래가 조회

- **`lib/ai-analysis.ts`**:
  - OpenAI GPT-4o 및 Claude 3.5 Sonnet API 호출
  - 입지 정보 기반 프롬프트 생성
  - JSON 형식 응답 파싱

### 컴포넌트
- **`components/PropertyInputForm.tsx`**: 사용자 입력 폼 (주소, 전용면적, AI 제공자)
- **`components/ValuationResult.tsx`**: 분석 결과 시각화 (가격, 점수, 차트)

## 카카오맵 API 사용 카테고리

현재 사용 중인 카테고리 코드:
- `SW8`: 지하철역
- `SC4`: 학교
- `HP8`: 병원
- `MT1`: 대형마트

키워드 검색:
- "공원": 근린공원 검색

## 실거래가 API 구현 상태

공공데이터포털 API는 XML 형식으로 응답을 반환합니다. 현재는 기본 구조만 구현되어 있으며, 실제 사용을 위해서는:

1. `xml2js` 라이브러리 설치 필요:
```bash
npm install xml2js
npm install --save-dev @types/xml2js
```

2. `lib/location.ts`의 `getRealEstateTransactions` 함수에서 XML 파싱 로직 추가 필요

## 향후 개선 사항

### 1. **실거래가 API 완전 구현**
- XML 파싱 로직 추가
- 유사 면적 필터링
- 최근 거래 우선 정렬

### 2. **추가 데이터 소스**
- 네이버 지도 API (보완적 정보)
- 국토교통부 도시계획 API (개발 계획)
- 학교알리미 API (학교 상세 정보)

### 3. **기능 확장**
- 지도 시각화 (Kakao Maps SDK)
- PDF 리포트 생성
- 분석 이력 저장 (DB 연동)
- 과거 가격 추이 그래프
- 주변 시세 비교

### 4. **성능 최적화**
- API 응답 캐싱 (Redis)
- 이미지 최적화
- 로딩 스켈레톤 UI

## 주의사항

⚠️ **이 프로젝트는 교육 및 참고 목적으로 제작되었습니다.**

- 실제 부동산 거래 시에는 반드시 공인된 감정평가사의 평가를 받으세요
- AI 분석 결과는 참고용이며, 실제 시장 가격과 차이가 있을 수 있습니다
- API 사용 시 비용이 발생할 수 있습니다:
  - OpenAI GPT-4o: 입력 $2.50/1M tokens, 출력 $10.00/1M tokens
  - Claude 3.5 Sonnet: 입력 $3.00/1M tokens, 출력 $15.00/1M tokens
  - 카카오맵 API: 무료 (일일 한도 있음)
  - 공공데이터포털: 무료
- 카카오맵 API는 키 발급 후 플랫폼 등록이 필요합니다
- 공공데이터 API 승인까지 1-2시간 소요될 수 있습니다

## 문제 해결

### 카카오맵 API 오류
- CORS 오류: 카카오 개발자 콘솔에서 플랫폼(Web) 등록 확인
- 401 Unauthorized: API 키 확인 및 키 활성화 상태 확인

### OpenAI/Claude API 오류
- 429 Rate Limit: 사용량 한도 확인
- 401 Unauthorized: API 키 확인 및 결제 정보 등록

### 주소 검색 실패
- 정확한 도로명 주소 또는 지번 주소 입력
- 상세 주소까지 포함하여 입력

## 라이선스

MIT License

## 기여

버그 리포트, 기능 제안, Pull Request를 환영합니다!

## 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 등록해주세요.
