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

For detailed API documentation, see `docs/README.md`.

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


