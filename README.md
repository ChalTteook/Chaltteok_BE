## Chaltteok BE

### Directory Structure

```text
Chaltteok_BE/
├─ chaltteok.js
├─ dockerfile
├─ docs/
│  ├─ README.md
│  ├─ common.md
│  ├─ auth-api.md
│  ├─ shop-api.md
│  ├─ review-api.md
│  ├─ report-api.md
│  └─ openapi-spec.yml
├─ logs/                  # Runtime logs (rotated by date)
├─ node_modules/
├─ package.json
├─ package-lock.json
├─ src/
│  ├─ controllers/        # Express route controllers
│  │  ├─ authController.js
│  │  ├─ shopController.js
│  │  ├─ reviewController.js
│  │  ├─ reportController.js
│  │  ├─ adminPartnerShopController.js
│  │  ├─ adminReportController.js
│  │  ├─ snapArtistController.js
│  │  ├─ userController.js
│  │  └─ VersionController.js
│  ├─ dataaccess/
│  │  ├─ mappers/         # MyBatis XML mappers
│  │  │  ├─ commonMapper.xml
│  │  │  ├─ userMapper.xml
│  │  │  ├─ userSessionMapper.xml
│  │  │  ├─ shopMapper.xml
│  │  │  ├─ reviewMapper.xml
│  │  │  ├─ reportMapper.xml
│  │  │  └─ snapArtistMapper.xml
│  │  └─ repositories/    # DB repository layer
│  │     ├─ commonRepository.js
│  │     ├─ userRepository.js
│  │     ├─ sessionRepository.js
│  │     ├─ shopRepository.js
│  │     └─ reportRepository.js
│  ├─ middlewares/
│  │  ├─ adminMiddleware.js
│  │  ├─ authMiddleware.js
│  │  └─ httpLogger.js
│  ├─ models/
│  │  ├─ userModel.js
│  │  ├─ reviewModel.js
│  │  ├─ reportModel.js
│  │  ├─ studio.js
│  │  ├─ SnapArtistModel.js
│  │  └─ SnapProductModel.js
│  ├─ services/           # Business logic layer
│  │  ├─ loginService.js
│  │  ├─ kakaoAuthService.js
│  │  ├─ socialAuthService.js
│  │  ├─ naverAuthService.js
│  │  ├─ userService.js
│  │  ├─ shopService.js
│  │  ├─ reviewService.js
│  │  ├─ reviewImageService.js
│  │  ├─ reportService.js
│  │  ├─ adminReportService.js
│  │  ├─ partnerShopService.js
│  │  ├─ snapArtistService.js
│  │  └─ versionService.js
│  └─ utils/
│     ├─ database.js
│     ├─ jwtUtil.js
│     ├─ logger.js
│     ├─ errorCodes.js
│     ├─ errorHandler.js
│     ├─ fileUploader.js
│     ├─ r2Util.js
│     └─ authMiddleware.js
├─ test/
│  ├─ login-api.unit.test.js
│  ├─ partner-shop-api.unit.test.js
│  ├─ report-api.unit.test.js
│  ├─ review-api.unit.test.js
│  └─ mockdata/
│     ├─ kakao-login-api-result.json
│     ├─ kakao-login-failure.png
│     ├─ kakao-login-page.png
│     ├─ kakao-login-test-result.json
│     ├─ mockup-data.json
│     └─ social-login-result.json
└─ uploads/               # Uploaded assets (e.g., review images)
```

For detailed API documentation, see the API overview below and the docs in `docs/`.

### Setup & Commands

#### 1) Prerequisites
- Node.js 18+ (LTS 권장)
- npm 9+

#### 2) Install
```bash
npm install
```

#### 3) Environment (.env)
프로젝트 루트에 `.env` 파일을 생성하고 다음 값을 설정하세요:
```env
# Server
PORT=9801
MODE=PROD
NODE_ENV=development

# JWT
JWT_SECRET_KEY=change_me
REFRESH_TOKEN_EXPIRATION=7d

# Database (MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=chaltteok

# S3 / R2 (옵션)
AWS_REGION=ap-northeast-2
AWS_S3_BUCKET=your-bucket
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

#### 4) Run (Development)
```bash
npm run dev
```
nodemon으로 `chaltteok.js`를 감시 실행합니다.

#### 5) Start (Alias)
```bash
npm start
```
내부적으로 `npm run dev`를 호출합니다.

#### 6) Test
```bash
# 1회 실행
npm test

# 변경 감시 모드
npm run test:watch
```
테스트 러너: `vitest`

#### 7) Build (Standalone binary)
```bash
npm run build
```
`pkg`를 사용하여 실행 바이너리를 생성합니다.


### API Overview

#### 기본 정보
- 기본 URL: `/api/v1`
- 인증: JWT Bearer Token (일부 API 필요)
- 응답 형식: JSON

#### 주요 기능 및 엔드포인트

- 인증/회원
  - 회원가입: `POST /auth/register`
  - 로그인: `POST /auth/login`
  - 소셜 로그인: `POST /auth/social-login`
  - 내 정보/프로필 조회 및 수정: `GET/PATCH /users/me`, `GET/PATCH /users/me/profile`
  - 비밀번호 변경: `POST /users/change-password`
  - 프로필 이미지 업로드/삭제: `POST/DELETE /users/me/profile-image`

- 공통
  - 휴대폰 인증번호 발송/확인: `POST /common/send/auth`, `POST /common/check/auth`
  - 이메일 인증코드 발송: `POST /common/send/email`

- 매장(Shop)
  - 매장 목록 조회: `GET /shops`
  - 매장 상세 조회: `GET /shops/{id}`

- 리뷰(Review)
  - 매장별 리뷰 목록 조회: `GET /shops/{shopId}/reviews`
  - 리뷰 작성: `POST /shops/{shopId}/reviews` (JWT 필요)
  - 리뷰 상세 조회: `GET /reviews/{reviewId}`
  - 리뷰 수정: `PUT /shops/{shopId}/reviews/{reviewId}` (JWT 필요)
  - 리뷰 삭제: `DELETE /shops/{shopId}/reviews/{reviewId}` (JWT 필요)
  - 리뷰 이미지 업로드: `POST /shops/{shopId}/reviews/{reviewId}/images` (JWT 필요, 최대 5장)
  - 리뷰 이미지 삭제: `DELETE /shops/{shopId}/reviews/{reviewId}/images/{imageIndex}` (JWT 필요)
  - 리뷰 좋아요: `POST /shops/{shopId}/reviews/{reviewId}/like` (JWT 필요)

- 신고(Report)
  - 리뷰/사용자/댓글 신고: `POST /reports`, `POST /reports/comments/{commentId}`
  - 내 신고 목록/상세 조회: `GET /reports/me`, `GET /reports/me/{reportId}`
  - 관리자: 전체 신고 목록/상세/상태변경, 샵/댓글별 신고 목록, 신고 통계 등

- 관리자/제휴매장
  - 제휴매장 목록/상세/삭제: `GET/DELETE /admin/partner-shops`, `/admin/partner-shops/{shopId}` (관리자 권한 필요)
  - 전체 신고 목록/상세/상태변경: `GET/PUT /admin/reports`, `/admin/reports/{reportId}` (관리자 권한 필요)
  - 샵/댓글별 신고 목록, 신고 통계: `GET /admin/reports/shops/{shopId}`, `/admin/reports/comments/{commentId}`, `/admin/reports/stats`

참고: 상세 파라미터와 응답 예시는 `docs/openapi-spec.yml` 및 `docs/*.md` 파일을 확인하세요.


