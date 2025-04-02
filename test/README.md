# 찰떡 (Chaltteok) 백엔드 테스트 가이드

## 테스트 디렉토리 구조

```
test/
├── README.md                 # 이 가이드 파일
├── api-guide-complete.md     # 통합 API 가이드 문서
├── comment-image-test.js     # 댓글 이미지 E2E 테스트
├── kakao-api-test.js         # 카카오 소셜 로그인 E2E 테스트
├── password-reset.test.js    # 비밀번호 재설정 E2E 테스트
├── profile-image-api.test.js # 프로필 이미지 API E2E 테스트
├── upload-test.js            # 파일 업로드 E2E 테스트
├── mockup-data.json          # 테스트용 목업 데이터
├── reset-email-test.js       # 이메일 재설정 테스트
├── .env.test                 # 테스트 환경 변수 파일
├── test.png                  # 테스트용 이미지 파일
├── docs/                     # 이전 API 문서 (레거시)
├── social-login-backup/      # 소셜 로그인 관련 백업 파일
├── social-login-deprecated/  # 사용되지 않는 소셜 로그인 테스트
└── utils/                    # 테스트 유틸리티 스크립트
```

## E2E 테스트 파일

현재 프로젝트는 다음 주요 E2E 테스트 파일을 포함합니다:

1. **카카오 소셜 로그인 테스트** - `kakao-api-test.js`
   - 카카오 인증 URL 획득
   - 인증 코드를 이용한 소셜 로그인 처리
   - 로그인 결과 검증

2. **댓글 이미지 테스트** - `comment-image-test.js`
   - 로그인 및 인증
   - 댓글 작성
   - 댓글 이미지 업로드 및 조회

3. **프로필 이미지 테스트** - `profile-image-api.test.js`
   - 프로필 정보 조회
   - 프로필 이미지 업로드
   - 프로필 이미지 삭제
   - 프로필 정보 업데이트

4. **비밀번호 재설정 테스트** - `password-reset.test.js`
   - 비밀번호 재설정 이메일 요청
   - 재설정 토큰 검증
   - 비밀번호 변경

5. **파일 업로드 테스트** - `upload-test.js`
   - 파일 업로드 API 테스트

## 테스트 실행 방법

### 사전 준비

1. 서버가 실행 중인지 확인하세요.
2. `.env.test` 파일에 필요한 환경 변수가 설정되어 있는지 확인하세요.

### 기본 테스트 실행

```bash
# 카카오 소셜 로그인 테스트
node test/kakao-api-test.js

# 댓글 이미지 테스트
node test/comment-image-test.js

# 프로필 이미지 API 테스트
node test/profile-image-api.test.js

# 비밀번호 재설정 테스트
node test/password-reset.test.js

# 파일 업로드 테스트
node test/upload-test.js
```

### 유틸리티 스크립트 실행

```bash
# 테스트 사용자 생성
node test/utils/create-test-user.js

# 테스트 리뷰 생성
node test/utils/create-test-review.js

# 댓글 테이블 생성
node test/utils/create-comments-table.js
```

## 테스트 가이드

각 E2E 테스트 파일은 통합 테스트로, 실제 API와 동일한 방식으로 요청을 전송하고 응답을 확인합니다. 테스트는 다음 단계를 일반적으로 포함합니다:

1. 로그인 및 인증 토큰 획득
2. API 엔드포인트 호출
3. 응답 검증
4. 리소스 정리 (필요한 경우)

## 문제 해결

1. **인증 오류**
   - `.env.test` 파일에 올바른 테스트 계정 정보가 있는지 확인하세요.
   - 로그인 API 응답을 확인하여 토큰이 올바르게 발급되는지 확인하세요.

2. **네트워크 오류**
   - 서버가 실행 중인지 확인하세요.
   - `API_BASE_URL`이 올바르게 설정되어 있는지 확인하세요.

3. **테스트 실패**
   - 콘솔 로그를 확인하여 어떤 부분에서 실패했는지 파악하세요.
   - 필요한 테스트 데이터가 DB에 존재하는지 확인하세요.

## API 문서

# 찰떡 (Chaltteok) API 종합 가이드

## 목차

1. [개요](#개요)
2. [기본 정보](#기본-정보)
3. [인증 API](#인증-api)
   - [로그인](#로그인)
   - [소셜 로그인](#소셜-로그인)
   - [비밀번호 재설정](#비밀번호-재설정)
4. [사용자 API](#사용자-api)
   - [프로필 조회](#프로필-조회)
   - [프로필 이미지 업로드](#프로필-이미지-업로드)
   - [프로필 이미지 삭제](#프로필-이미지-삭제)
   - [프로필 업데이트](#프로필-업데이트)
5. [상점(Shop) API](#상점-api)
6. [리뷰 API](#리뷰-api)
7. [댓글 API](#댓글-api)
   - [댓글 이미지 업로드](#댓글-이미지-업로드)
8. [테스트 가이드](#테스트-가이드)
   - [소셜 로그인 테스트](#소셜-로그인-테스트)
   - [파일 업로드 테스트](#파일-업로드-테스트)

---

## 개요

이 문서는 찰떡(Chaltteok) 백엔드 프로젝트의 API 사용 방법을 설명하는 종합 가이드입니다. 프론트엔드 개발자는 이 가이드를 참고하여 각 기능을 구현할 수 있습니다.

## 기본 정보

**기본 URL**
```
http://서버주소:9801/api/v1
```

**인증**
대부분의 API는 JWT 토큰을 필요로 합니다. 토큰은 Authorization 헤더에 다음과 같은 형식으로 포함되어야 합니다:
```
Authorization: Bearer {토큰값}
```

**응답 형식**
모든 API는 기본적으로 다음과 같은 JSON 응답 형식을 따릅니다:
```json
{
  "success": true/false,
  "message": "성공 또는 실패 메시지",
  "data": {} // 응답 데이터 (API에 따라 다름)
}
```

---

## 인증 API

### 로그인

**요청**
```
POST /auth/login
Content-Type: application/json

{
  "email": "사용자 이메일",
  "password": "사용자 비밀번호"
}
```

**응답 예시**
```json
{
  "success": true,
  "token": "JWT_토큰_문자열",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "사용자이름",
    ...
  }
}
```

### 소셜 로그인

#### 인증 URL 획득

**요청**
```
GET /auth/kakao_auth
```

**응답 예시**
```json
{
  "success": true,
  "data": "https://accounts.kakao.com/login?continue=https%3A%2F%2Fkauth.kakao.com%2Foauth%2Fauthorize%3F..."
}
```

#### 소셜 로그인 인증

**요청**
```
POST /auth/social-login
Content-Type: application/json

{
  "provider": "kakao",
  "code": "인증_코드"
}
```

**응답 예시**
```json
{
  "success": true,
  "token": "JWT_토큰_문자열",
  "user": {
    "id": 3,
    "socialId": "12345678",
    "type": "kakao",
    ...
  }
}
```

### 비밀번호 재설정

#### 비밀번호 재설정 이메일 요청

**요청**
```
POST /auth/request-password-reset
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**응답 예시**
```json
{
  "success": true,
  "message": "비밀번호 재설정 링크가 이메일로 발송되었습니다."
}
```

#### 비밀번호 재설정

**요청**
```
POST /auth/reset-password
Content-Type: application/json

{
  "token": "비밀번호_재설정_토큰",
  "password": "새_비밀번호"
}
```

**응답 예시**
```json
{
  "success": true,
  "message": "비밀번호가 성공적으로 변경되었습니다."
}
```

---

## 사용자 API

### 프로필 조회

**요청**
```
GET /users/me/profile
Authorization: Bearer {토큰값}
```

**응답 예시**
```json
{
  "success": true,
  "profile": {
    "id": 1,
    "name": "사용자이름",
    "email": "user@example.com",
    "phone": "01012345678",
    "address": "서울특별시",
    "profileImage": "https://example.com/profile/image.jpg"
  }
}
```

### 프로필 이미지 업로드

**요청**
```
POST /users/me/profile-image
Authorization: Bearer {토큰값}
Content-Type: multipart/form-data

form-data:
- image: [이미지 파일]
```

**응답 예시**
```json
{
  "success": true,
  "imageUrl": "https://example.com/profile/image.jpg"
}
```

### 프로필 이미지 삭제

**요청**
```
DELETE /users/me/profile-image
Authorization: Bearer {토큰값}
```

**응답 예시**
```json
{
  "success": true,
  "message": "프로필 이미지가 성공적으로 삭제되었습니다."
}
```

### 프로필 업데이트

**요청**
```
PUT /users/me/profile
Authorization: Bearer {토큰값}
Content-Type: application/json

{
  "name": "새이름",
  "phone": "01087654321",
  "address": "부산광역시"
}
```

**응답 예시**
```json
{
  "success": true,
  "profile": {
    "id": 1,
    "name": "새이름",
    "email": "user@example.com",
    "phone": "01087654321",
    "address": "부산광역시",
    "profileImage": "https://example.com/profile/image.jpg"
  }
}
```

---

## 상점 API

### 상점 목록 조회

**요청**
```
GET /shops?page=1&limit=20&sort=price
```

**정렬 옵션**
- `price`: 가격순 정렬
- `review`: 리뷰 수 기준 정렬
- `recommendation`: 추천 수 기준 정렬

**응답 예시**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "찰떡상점1",
      "address": "서울시 강남구",
      "price": 10000,
      "review_count": 5,
      "total_likes": 10
    },
    ...
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 100
  }
}
```

### 상점 상세 조회

**요청**
```
GET /shops/{shop_id}
```

**응답 예시**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "찰떡상점1",
    "address": "서울시 강남구",
    "description": "맛있는 찰떡 가게",
    "price": 10000,
    "review_count": 5,
    "total_likes": 10,
    "images": [
      "https://example.com/shop/image1.jpg",
      "https://example.com/shop/image2.jpg"
    ]
  }
}
```

---

## 리뷰 API

### 리뷰 작성

**요청**
```
POST /shops/{shop_id}/reviews
Authorization: Bearer {토큰값}
Content-Type: application/json

{
  "title": "리뷰 제목",
  "content": "리뷰 내용",
  "rating": 4.5
}
```

**응답 예시**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "리뷰 제목",
    "content": "리뷰 내용",
    "rating": 4.5,
    "created_at": "2023-03-15T12:00:00Z",
    "user": {
      "id": 1,
      "name": "사용자이름"
    }
  }
}
```

### 리뷰 조회

**요청**
```
GET /shops/{shop_id}/reviews?page=1&limit=10
```

**응답 예시**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "리뷰 제목",
      "content": "리뷰 내용",
      "rating": 4.5,
      "created_at": "2023-03-15T12:00:00Z",
      "user": {
        "id": 1,
        "name": "사용자이름"
      },
      "images": [
        "https://example.com/review/image1.jpg"
      ]
    },
    ...
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 25
  }
}
```

---

## 댓글 API

### 댓글 작성

**요청**
```
POST /reviews/{review_id}/comments
Authorization: Bearer {토큰값}
Content-Type: application/json

{
  "content": "댓글 내용"
}
```

**응답 예시**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "content": "댓글 내용",
    "created_at": "2023-03-15T13:00:00Z",
    "user": {
      "id": 1,
      "name": "사용자이름"
    }
  }
}
```

### 댓글 조회

**요청**
```
GET /reviews/{review_id}/comments?page=1&limit=20
```

**응답 예시**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "content": "댓글 내용",
      "created_at": "2023-03-15T13:00:00Z",
      "user": {
        "id": 1,
        "name": "사용자이름"
      },
      "images": [
        "https://example.com/comment/image1.jpg"
      ]
    },
    ...
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalItems": 35
  }
}
```

### 댓글 이미지 업로드

**요청**
```
POST /comments/{comment_id}/images
Authorization: Bearer {토큰값}
Content-Type: multipart/form-data

form-data:
- image: [이미지 파일]
```

**응답 예시**
```json
{
  "success": true,
  "data": {
    "image_url": "https://example.com/comment/image.jpg",
    "comment_id": 1
  }
}
```

---

## 테스트 가이드

### 소셜 로그인 테스트

카카오 소셜 로그인 테스트를 실행하려면 다음 명령어를 사용하세요:

```bash
node test/kakao-api-test.js
```

테스트는 다음 단계로 진행됩니다:

1. **인증 URL 획득**: 백엔드 API에서 카카오 인증 URL을 가져옵니다.
2. **인증 코드 입력**: 
   - 제공된 URL을 브라우저에서 열어 카카오 계정으로 로그인합니다.
   - 로그인 후 리다이렉트된 URL에서 `code` 파라미터 값을 복사합니다.
   - 복사한 코드를 터미널에 입력합니다.
3. **소셜 로그인 API 호출**: 
   - 입력받은 인증 코드로 소셜 로그인 API를 호출합니다.
   - 로그인 성공 시 사용자 정보와 토큰을 확인합니다.

### 파일 업로드 테스트

프로필 이미지 업로드 테스트를 실행하려면 다음 명령어를 사용하세요:

```bash
node test/profile-image-api.test.js
```

이 테스트는 다음 기능을 확인합니다:
- 로그인
- 프로필 정보 조회
- 프로필 이미지 업로드
- 프로필 이미지 삭제
- 프로필 정보 업데이트

### 비밀번호 재설정 테스트

비밀번호 재설정 테스트를 실행하려면 다음 명령어를 사용하세요:

```bash
node test/password-reset.test.js
```

이 테스트는 다음 기능을 확인합니다:
- 로그인
- 비밀번호 재설정 이메일 요청
- 비밀번호 재설정 토큰 검증
- 비밀번호 재설정

### 댓글 이미지 테스트

댓글 이미지 기능 테스트를 실행하려면 다음 명령어를 사용하세요:

```bash
node test/comment-image-test.js
```

이 테스트는 다음 기능을 확인합니다:
- 로그인
- 댓글 작성
- 댓글 이미지 업로드
- 댓글 이미지가 포함된 댓글 조회 