# 찰떡 API 문서

## 개요
찰떡 서비스의 API 문서입니다. 이 문서는 클라이언트와 서버 간의 통신에 사용되는 API의 명세를 제공합니다.

## 기본 정보
- **기본 URL:** `/api/v1`
- **인증:** JWT Bearer Token (일부 API 필요)
- **응답 형식:** JSON

## 주요 기능 및 엔드포인트

### 1. 인증/회원
- 회원가입: `POST /auth/register`
- 로그인: `POST /auth/login`
- 소셜 로그인: `POST /auth/social-login`
- 내 정보/프로필 조회 및 수정: `GET/PATCH /users/me`, `GET/PATCH /users/me/profile`
- 비밀번호 변경: `POST /users/change-password`
- 프로필 이미지 업로드/삭제: `POST/DELETE /users/me/profile-image`

### 2. 공통
- 휴대폰 인증번호 발송/확인: `POST /common/send/auth`, `POST /common/check/auth`
- 이메일 인증코드 발송: `POST /common/send/email`

### 3. 매장(Shop)
- 매장 목록 조회: `GET /shops`
- 매장 상세 조회: `GET /shops/{id}`

### 4. 리뷰(Review)
- 매장별 리뷰 목록 조회: `GET /shops/{shopId}/reviews`
- 리뷰 작성: `POST /shops/{shopId}/reviews` (JWT 필요)
- 리뷰 상세 조회: `GET /reviews/{reviewId}`
- 리뷰 수정: `PUT /shops/{shopId}/reviews/{reviewId}` (JWT 필요)
- 리뷰 삭제: `DELETE /shops/{shopId}/reviews/{reviewId}` (JWT 필요)
- 리뷰 이미지 업로드: `POST /shops/{shopId}/reviews/{reviewId}/images` (JWT 필요, 최대 5장)
- 리뷰 이미지 삭제: `DELETE /shops/{shopId}/reviews/{reviewId}/images/{imageIndex}` (JWT 필요)
- 리뷰 좋아요: `POST /shops/{shopId}/reviews/{reviewId}/like` (JWT 필요)

### 5. 신고(Report)
- 리뷰/사용자/댓글 신고: `POST /reports`, `POST /reports/comments/{commentId}`
- 내 신고 목록/상세 조회: `GET /reports/me`, `GET /reports/me/{reportId}`
- 관리자: 전체 신고 목록/상세/상태변경, 샵/댓글별 신고 목록, 신고 통계 등

### 6. 관리자/제휴매장
- 제휴매장 목록/상세/삭제: `GET/DELETE /admin/partner-shops`, `/admin/partner-shops/{shopId}` (관리자 권한 필요)
- 전체 신고 목록/상세/상태변경: `GET/PUT /admin/reports`, `/admin/reports/{reportId}` (관리자 권한 필요)
- 샵/댓글별 신고 목록, 신고 통계: `GET /admin/reports/shops/{shopId}`, `/admin/reports/comments/{commentId}`, `/admin/reports/stats`

---

## 참고
- 상세 파라미터, 응답 예시, 에러코드 등은 openapi-spec.yml을 참고하세요.
- 관리자 기능, 제휴매장 관리 등은 별도 문서 또는 openapi-spec.yml에 포함되어 있습니다.