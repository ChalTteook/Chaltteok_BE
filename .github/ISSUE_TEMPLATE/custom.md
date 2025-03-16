# 찰떡 (Chaltteok) 백엔드 API 가이드

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

---

# 찰떡 (Chaltteok) API 종합 가이드

## 목차

1. [개요](#개요)
2. [기본 정보](#기본-정보)
3. [인증 API](#인증-api)
4. [사용자 API](#사용자-api)
5. [상점(Shop) API](#상점-api)
6. [리뷰 이미지 API](#리뷰-이미지-api)
7. [댓글 API](#댓글-api)
8. [공통 API](#공통-api)

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

### 회원가입

**요청**
```
POST /auth/register
Content-Type: application/json

{
  "email": "사용자 이메일",
  "password": "사용자 비밀번호",
  "name": "사용자 이름",
  "phone": "전화번호",
  "address": "주소"
}
```

**응답 예시**
```json
{
  "success": true,
  "message": "회원가입 성공"
}
```

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

---

## 사용자 API

### 현재 사용자 정보 조회

**요청**
```
GET /user/me
Authorization: Bearer {토큰값}
```

**응답 예시**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "사용자이름",
    "email": "user@example.com",
    "phone": "01012345678",
    "address": "서울특별시",
    "type": "email",
    "age": 30,
    "gender": "M",
    "nickName": "닉네임",
    "profileImage": "이미지파일명"
    // 기타 사용자 정보
  }
}
```

### 프로필 정보 조회

**요청**
```
GET /user/me/profile
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
    "socialId": null,
    "type": "email",
    "profileImage": "/uploads/profile-images/image.jpg"
  }
}
```

### 프로필 업데이트

**요청**
```
PATCH /user/me/profile
Authorization: Bearer {토큰값}
Content-Type: application/json

{
  "name": "새이름",
  "phone": "01087654321",
  "address": "부산광역시",
  "age": 32,
  "gender": "F",
  "nickName": "새닉네임"
}
```

**응답 예시**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "name": "새이름",
    "email": "user@example.com",
    "phone": "01087654321",
    "address": "부산광역시",
    "age": 32,
    "gender": "F",
    "nickName": "새닉네임",
    // 기타 사용자 정보
  }
}
```

### 비밀번호 변경

**요청**
```
POST /user/change-password
Authorization: Bearer {토큰값}
Content-Type: application/json

{
  "newPassword": "새비밀번호",
  "confirmPassword": "새비밀번호"
}
```

**응답 예시**
```json
{
  "success": true,
  "message": "password change success"
}
```

### 프로필 이미지 업로드

**요청**
```
POST /user/me/profile-image
Authorization: Bearer {토큰값}
Content-Type: multipart/form-data

form-data:
- profileImage: [이미지 파일]
```

**응답 예시**
```json
{
  "success": true,
  "message": "프로필 이미지가 업로드되었습니다.",
  "profileImage": "/uploads/profile-images/uuid-filename.png"
}
```

### 프로필 이미지 삭제

**요청**
```
DELETE /user/me/profile-image
Authorization: Bearer {토큰값}
```

**응답 예시**
```json
{
  "success": true,
  "message": "프로필 이미지가 삭제되었습니다."
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
- 기본값 또는 다른 값: 기본 정렬

**응답 예시**
```json
{
  "success": true,
  "size": 20,
  "data": [
    {
      "id": 1,
      "name": "찰떡상점1",
      "address": "서울시 강남구",
      "price": 10000,
      // 기타 상점 정보
    },
    // 추가 상점 정보
  ]
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
    // 기타 상점 상세 정보
  }
}
```

---

## 리뷰 이미지 API

### 리뷰 이미지 업로드

**요청**
```
POST /reviews/{reviewId}/images?index={imageIndex}
Authorization: Bearer {토큰값}
Content-Type: multipart/form-data

form-data:
- image: [이미지 파일]
```

**매개변수**
- `reviewId`: 리뷰 ID (경로 매개변수)
- `index`: 이미지 인덱스 (1~5 범위, 쿼리 매개변수)

**응답 예시**
```json
{
  "success": true,
  "data": {
    "imageUrl": "이미지_URL"
  }
}
```

### 리뷰 이미지 삭제

**요청**
```
DELETE /reviews/{reviewId}/images/{imageIndex}
Authorization: Bearer {토큰값}
```

**매개변수**
- `reviewId`: 리뷰 ID (경로 매개변수)
- `imageIndex`: 이미지 인덱스 (1~5 범위, 경로 매개변수)

**응답 예시**
```json
{
  "success": true,
  "message": "이미지가 성공적으로 삭제되었습니다."
}
```

---

## 댓글 API

### 댓글 목록 조회

**요청**
```
GET /comments/{reviewId}/comments
```

**매개변수**
- `reviewId`: 리뷰 ID (경로 매개변수)

**응답 예시**
```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "id": 1,
        "content": "댓글 내용",
        "created_at": "2023-03-15T12:00:00Z",
        "user": {
          "id": 1,
          "name": "사용자이름"
        }
        // 기타 댓글 정보
      },
      // 추가 댓글
    ]
  }
}
```

### 댓글 작성

**요청**
```
POST /comments/{reviewId}/comments
Authorization: Bearer {토큰값}
Content-Type: application/json

{
  "content": "댓글 내용"
}
```

**매개변수**
- `reviewId`: 리뷰 ID (경로 매개변수)

**응답 예시**
```json
{
  "success": true,
  "data": {
    "comment": {
      "id": 1,
      "content": "댓글 내용",
      // 기타 댓글 정보
    }
  }
}
```

### 댓글 수정

**요청**
```
PUT /comments/{commentId}
Authorization: Bearer {토큰값}
Content-Type: application/json

{
  "content": "수정된 댓글 내용"
}
```

**매개변수**
- `commentId`: 댓글 ID (경로 매개변수)

**응답 예시**
```json
{
  "success": true,
  "message": "댓글이 성공적으로 수정되었습니다."
}
```

### 댓글 삭제

**요청**
```
DELETE /comments/{commentId}
Authorization: Bearer {토큰값}
```

**매개변수**
- `commentId`: 댓글 ID (경로 매개변수)

**응답 예시**
```json
{
  "success": true,
  "message": "댓글이 성공적으로 삭제되었습니다."
}
```

---

## 공통 API

### 인증 코드 발송

**요청**
```
POST /common/send/auth
Content-Type: application/json

{
  "phone_number": "전화번호"
}
```

**응답 예시**
```json
{
  "success": true,
  "message": "인증 코드가 발송되었습니다."
}
```

### 인증 코드 확인

**요청**
```
POST /common/check/auth
Content-Type: application/json

{
  "phone_number": "전화번호",
  "code": "인증코드"
}
```

**응답 예시**
```json
{
  "success": true,
  "message": "인증이 완료되었습니다."
}
```

### 이메일 발송

**요청**
```
POST /common/send/email
Content-Type: application/json

{
  "email": "이메일주소"
}
```

**응답 예시**
```json
{
  "success": true,
  "message": "이메일이 발송되었습니다."
}
```

---

## 테스트 가이드

### 프로필 이미지 테스트

프로필 이미지 업로드 테스트를 실행하려면 다음 명령어를 사용하세요:

```bash
node test/profile-image-api.test.js
```

이 테스트는 다음 기능을 확인합니다:
- 로그인
- 프로필 정보 조회
- 프로필 이미지 업로드
- 잘못된 형식의 파일 업로드 거부
- 프로필 이미지 접근성
- 프로필 이미지 삭제
- 프로필 정보 업데이트

### 주의사항

1. 테스트 실행 전 서버가 실행중인지 확인하세요.
2. 테스트용 계정 정보는 실제 환경과 분리하여 관리하는 것이 좋습니다.
3. 이미지 파일은 PNG, JPEG, GIF, WEBP 형식만 지원합니다.
4. 업로드된 이미지는 프로젝트의 uploads 디렉토리에 저장됩니다. 