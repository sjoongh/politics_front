브리핑 코리아
Firebase + Python + React 기반의 실시간 정치 뉴스 수집 및 AI 요약 서비스 : 11월 구글스토어 브리핑 코리아 출시

🚀 주요 기능
📰 뉴스 수집 및 관리
RSS 기반 합법적 수집: 주요 언론사 RSS 피드를 통한 실시간 뉴스 수집

AI 요약: OpenAI API를 활용한 자동 뉴스 요약

카테고리 분류: 대통령, 국회, 정치, 속보 등 자동 분류

중복 방지: 해시 기반 중복 기사 자동 감지

👤 사용자 인증 및 개인화
JWT 기반 인증: 안전한 사용자 인증 시스템

Firebase 연동: Firebase Authentication과 Firestore 활용

개인 맞춤 설정: 관심 분야별 뉴스 필터링

북마크 기능: 관심 기사 저장 및 관리

🤖 AI 기능
일일 요약: 매일 주요 정치 뉴스 종합 요약

키워드 추출: 기사별 핵심 키워드 자동 추출

중요도 분석: 뉴스 우선순위 자동 분류

🔔 실시간 알림
Firebase Cloud Messaging: 실시간 푸시 알림

우선순위 시스템: 중요도별 알림 분류

맞춤 알림: 사용자 관심사 기반 개인화 알림

🏗️ 기술 스택
백엔드
Python 3.9+: 메인 백엔드 언어

FastAPI: 고성능 웹 프레임워크

Firebase Admin SDK: 서버 사이드 Firebase 연동

Firestore: NoSQL 데이터베이스

OpenAI API: AI 요약 서비스

feedparser: RSS 피드 파싱

Pydantic: 데이터 검증 및 모델링

프론트엔드
React 18: UI 라이브러리

React Router: 클라이언트 사이드 라우팅

Tailwind CSS: 유틸리티 기반 CSS 프레임워크

Axios: HTTP 클라이언트

React Hot Toast: 사용자 알림 UI

Lucide React: 아이콘 라이브러리

인프라 및 도구
Firebase: 인증, 데이터베이스, 호스팅

Vercel/Netlify: 프론트엔드 배포

Google Cloud Run: 백엔드 컨테이너 배포

📁 프로젝트 구조
text
political-news-app/
├── backend/                 # Python FastAPI 백엔드
│   ├── services/           # 비즈니스 로직 서비스
│   │   ├── auth_service.py
│   │   ├── news_service.py
│   │   ├── ai_summary_service.py
│   │   └── notification_service.py
│   ├── utils/              # 유틸리티 함수
│   ├── firebase_config.py  # Firebase 설정
│   ├── models.py          # Pydantic 모델
│   ├── main.py           # FastAPI 메인 앱
│   ├── requirements.txt   # Python 의존성
│   └── .env.example      # 환경변수 예시
├── frontend/               # React 프론트엔드
│   ├── src/
│   │   ├── components/    # React 컴포넌트
│   │   ├── contexts/      # React 컨텍스트
│   │   ├── hooks/         # 커스텀 훅
│   │   ├── services/      # API 서비스
│   │   └── App.js        # 메인 앱 컴포넌트
│   ├── package.json      # Node.js 의존성
│   └── .env.example     # 환경변수 예시
└── README.md           # 프로젝트 문서
🚀 빠른 시작
1. 저장소 클론
bash
git clone <repository-url>
cd political-news-app
2. 자동 설정 스크립트 실행
bash
chmod +x start.sh
./start.sh
3. 환경변수 설정
백엔드 (.env)
bash
cd backend
cp .env.example .env
.env 파일을 편집하여 다음 값들을 설정:

text
# Firebase 설정
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com

# OpenAI 설정
OPENAI_API_KEY=your-openai-api-key

# JWT 설정
SECRET_KEY=your-super-secret-jwt-key
프론트엔드 (.env)
bash
cd frontend
cp .env.example .env
.env 파일을 편집하여 Firebase 설정:

text
REACT_APP_API_URL=http://localhost:8000
REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
4. 서버 실행
백엔드 서버
bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
python run_server.py
프론트엔드 서버
bash
cd frontend
npm start
5. 접속
프론트엔드: http://localhost:3000

백엔드 API: http://localhost:8000

API 문서: http://localhost:8000/docs

🔧 개발 가이드
Firebase 설정
Firebase Console에서 새 프로젝트 생성

Authentication 활성화 (이메일/비밀번호 방식)

Firestore 데이터베이스 생성

프로젝트 설정 > 서비스 계정에서 비공개 키 생성

생성된 JSON 키의 내용을 환경변수에 설정

OpenAI API 설정
OpenAI Platform에서 API 키 생성

백엔드 .env 파일에 OPENAI_API_KEY 설정

사용량 제한 및 요금 정책 확인

뉴스 수집 설정
현재 지원하는 RSS 피드:

연합뉴스 정치: https://www.yna.co.kr/rss/politics.xml

한국경제 정치: https://rss.hankyung.com/politics.xml

경향신문 정치: https://www.khan.co.kr/rss/rssdata/kh_politics.xml

추가 RSS 피드는 backend/services/news_service.py에서 설정 가능

📊 API 문서
주요 엔드포인트
인증
POST /api/auth/register - 회원가입

POST /api/auth/login - 로그인

GET /api/auth/me - 현재 사용자 정보

PUT /api/auth/profile - 프로필 업데이트

뉴스
GET /api/news - 뉴스 목록 조회

GET /api/news/{article_id} - 뉴스 상세 조회

GET /api/news/search - 뉴스 검색

POST /api/news/collect - 뉴스 수집 (관리자)

AI 요약
GET /api/summary/daily - 일일 요약 조회

POST /api/summary/daily - 일일 요약 생성 (관리자)

알림
GET /api/notifications - 알림 목록 조회

PUT /api/notifications/{id}/read - 알림 읽음 처리

PUT /api/notifications/read-all - 모든 알림 읽음 처리

북마크
POST /api/bookmarks - 북마크 추가

GET /api/bookmarks - 북마크 목록 조회

자세한 API 문서는 서버 실행 후 http://localhost:8000/docs 에서 확인 가능

🔐 보안 고려사항
데이터 보호
JWT 토큰 기반 인증 시스템

Firebase Security Rules 적용

환경변수를 통한 민감 정보 관리

CORS 정책 적용

저작권 준수
RSS 피드 공식 사용 (언론사 허가)

기사 제목과 요약만 저장 (원문 미저장)

출처 명시 및 원문 링크 제공

상업적 사용 금지 (개인 프로젝트 목적)

🚀 배포 가이드
백엔드 배포 (Google Cloud Run)
Docker 이미지 빌드

bash
cd backend
docker build -t political-news-api .
Google Cloud 배포

bash
gcloud run deploy political-news-api \
  --image gcr.io/PROJECT-ID/political-news-api \
  --platform managed \
  --region asia-northeast1
프론트엔드 배포 (Vercel)
Vercel CLI 설치 및 배포

bash
cd frontend
npm i -g vercel
vercel --prod
환경변수 설정 (Vercel Dashboard)

REACT_APP_API_URL: 배포된 백엔드 URL

Firebase 설정 변수들

🛠️ 문제 해결
자주 발생하는 문제
Firebase 연결 오류

서비스 계정 키 확인

프로젝트 ID 일치 확인

Firestore 규칙 설정 확인

OpenAI API 오류

API 키 유효성 확인

사용량 한도 확인

네트워크 연결 상태 확인

CORS 오류

백엔드 CORS 설정 확인

프론트엔드 API URL 확인

📈 향후 개발 계획
단기 목표
 모바일 앱 개발 (React Native)

 실시간 알림 개선

 더 많은 언론사 RSS 피드 추가

 사용자 행동 분석 기능

장기 목표
 머신러닝 기반 뉴스 추천

 다국어 지원

 소셜 기능 (댓글, 공유)

 프리미엄 구독 모델

🤝 기여하기
이 저장소를 포크합니다

새 기능 브랜치를 생성합니다 (git checkout -b feature/AmazingFeature)

변경사항을 커밋합니다 (git commit -m 'Add some AmazingFeature')

브랜치에 푸시합니다 (git push origin feature/AmazingFeature)

Pull Request를 생성합니다

📄 라이선스
이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 LICENSE 파일을 참조하세요.

📞 지원 및 문의
이슈 등록: GitHub Issues 탭 활용

기능 제안: GitHub Discussions 활용

보안 취약점: 비공개 이메일로 연락

🙏 감사의 말
OpenAI - AI 요약 서비스

Firebase - 백엔드 인프라

FastAPI - 웹 프레임워크

React - 프론트엔드 라이브러리

Tailwind CSS - CSS 프레임워크

⚠️ 주의사항: 이 프로젝트는 교육 및 개인 학습 목적으로 제작되었습니다. 상업적 사용 시 관련 법규 및 저작권을 반드시 확인하시기 바랍니다.
