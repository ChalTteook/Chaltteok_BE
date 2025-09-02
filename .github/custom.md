# 찰떡 API 문서

## 목차
- [개요](#개요)
- [공통 사항](#공통-사항)
- [인증 API](#인증-api)
- [매장 API](#매장-api)
- [리뷰 API](#리뷰-api)
- [신고 API](#신고-api)

## 개요
찰떡 서비스의 API 문서입니다. 이 문서는 클라이언트와 서버 간의 통신에 사용되는 API의 명세를 제공합니다.

## 공통 사항

### 기본 URL
```
http://localhost:9801/api/v1
```

### 응답 형식
모든 API 응답은 다음 형식을 따릅니다:
```json
{
  "success": true/false,
  "data": {}, // 또는 배열 (성공 시)
  "message": "오류 메시지" // 실패 시
}
```

### 인증
인증이 필요한 API의 경우, 요청 헤더에 JWT 토큰을 포함해야 합니다:
```
Authorization: Bearer {token}
```

## 인증 API

### 회원가입
- **URL**: `/auth/register`
- **Method**: `POST`
- **인증 필요**: 아니오
- **Request Body**:
  ```json
  {
    "email": "newtest@example.com",
    "password": "password123",
    "name": "테스트 사용자",
    "phone": "01012345678"
  }
  ```
- **성공 응답 (201)**:
  ```json
  {
    "success": true,
    "message": "회원가입 성공"
  }
  ```
- **실패 응답 (400)**:
  ```json
  {
    "success": false,
    "message": "이미 존재하는 이메일입니다."
  }
  ```

### 로그인
- **URL**: `/auth/login`
- **Method**: `POST`
- **인증 필요**: 아니오
- **Request Body**:
  ```json
  {
    "email": "newtest@example.com",
    "password": "password123"
  }
  ```
- **성공 응답 (200)**:
  ```json
  {
    "success": true,
    "user": {
      "id": 35,
      "type": "email",
      "email": "newtest@example.com",
      "name": "테스트 사용자",
      "phone": "01012345678",
      "address": "",
      "profileImage": null
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **실패 응답 (401)**:
  ```json
  {
    "success": false,
    "message": "이메일 또는 비밀번호가 잘못되었습니다."
  }
  ```

## 매장 API

### 매장 목록 조회
- **URL**: `/shops`
- **Method**: `GET`
- **인증 필요**: 아니오
- **Query Parameters**:
  - `page`: 페이지 번호 (기본값: 1)
  - `limit`: 페이지당 항목 수 (기본값: 20)
- **성공 응답 (200)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 11670753,
        "title": "연희사진관",
        "description": "생활,편의,사진,스튜디오",
        "phone_number": "02-363-2039",
        "open_time": "Unknown",
        "close_time": "Unknown",
        "address": "서울특별시 서대문구 대현동 54-18",
        "latitude": "37.5576075",
        "longitude": "126.9459977",
        "parking": null,
        "floor": null,
        "price": null,
        "img": "https://ldb-phinf.pstatic.net/20240711_27/1720690940949LHUQy_JPEG/IMG_5652.jpeg",
        "reg_date": "2025-02-19 08:52:22",
        "mod_date": "2025-02-19 08:52:22",
        "is_partner": 1,
        "partner_date": "2025-03-23",
        "expiry_date": "2026-03-23",
        "partner_status": "active"
      },
      // ... 더 많은 매장 항목
    ]
  }
  ```

### 매장 상세 조회
- **URL**: `/shops/:id`
- **Method**: `GET`
- **인증 필요**: 아니오
- **Path Parameters**:
  - `id`: 매장 ID
- **성공 응답 (200)**:
  ```json
  {
    "success": true,
    "data": {
      "id": 11670753,
      "title": "연희사진관",
      "description": "생활,편의,사진,스튜디오",
      "phone_number": "02-363-2039",
      "open_time": "Unknown",
      "close_time": "Unknown",
      "address": "서울특별시 서대문구 대현동 54-18",
      "latitude": "37.5576075",
      "longitude": "126.9459977",
      "parking": null,
      "floor": null,
      "price": null,
      "img": "https://ldb-phinf.pstatic.net/20240711_27/1720690940949LHUQy_JPEG/IMG_5652.jpeg",
      "reg_date": "2025-02-19 08:52:22",
      "mod_date": "2025-02-19 08:52:22",
      "is_partner": 1,
      "partner_date": "2025-03-23",
      "expiry_date": "2026-03-23",
      "partner_status": "active"
    }
  }
  ```
- **실패 응답 (404)**:
  ```json
  {
    "success": false,
    "message": "해당 매장을 찾을 수 없습니다."
  }
  ```

## 리뷰 API

### 매장 리뷰 목록 조회
- **URL**: `/reviews/shops/:shopId`
- **Method**: `GET`
- **인증 필요**: 아니오
- **Path Parameters**:
  - `shopId`: 매장 ID
- **Query Parameters**:
  - `page`: 페이지 번호 (기본값: 1)
  - `limit`: 페이지당 항목 수 (기본값: 20)
- **성공 응답 (200)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 46,
        "shopId": 11670753,
        "shopPrdId": 0,
        "userId": 30,
        "description": "테스트 리뷰입니다",
        "img1": "/uploads/review-images/46_1_ac77ea01-d8d7-478d-8dab-d1473e804d07.png",
        "img2": null,
        "img3": null,
        "img4": null,
        "img5": null,
        "likeCount": 0,
        "regDate": "2025-03-30 07:32:49",
        "modDate": "2025-03-30 07:32:49",
        "userName": "새로운 테스트 사용자",
        "userProfileImage": null,
        "shopName": null
      },
      // ... 더 많은 리뷰 항목
    ]
  }
  ```

### 리뷰 상세 조회
- **URL**: `/reviews/:reviewId`
- **Method**: `GET`
- **인증 필요**: 아니오
- **Path Parameters**:
  - `reviewId`: 리뷰 ID
- **성공 응답 (200)**:
  ```json
  {
    "success": true,
    "data": {
      "id": 46,
      "shopId": 11670753,
      "shopPrdId": 0,
      "userId": 30,
      "description": "테스트 리뷰입니다",
      "img1": "/uploads/review-images/46_1_ac77ea01-d8d7-478d-8dab-d1473e804d07.png",
      "img2": null,
      "img3": null,
      "img4": null,
      "img5": null,
      "likeCount": 0,
      "regDate": "2025-03-30 07:32:49",
      "modDate": "2025-03-30 07:32:49",
      "userName": "새로운 테스트 사용자",
      "userProfileImage": null,
      "shopName": "연희사진관"
    }
  }
  ```

### 리뷰 작성
- **URL**: `/reviews/shops/:shopId`
- **Method**: `POST`
- **인증 필요**: 예
- **Path Parameters**:
  - `shopId`: 매장 ID
- **Request Body**:
  ```json
  {
    "description": "매우 좋은 서비스였습니다!",
    "images": [] // 선택적 이미지 Base64 인코딩 배열
  }
  ```
- **성공 응답 (201)**:
  ```json
  {
    "success": true,
    "data": {
      "id": 47,
      "shopId": 11670753,
      "userId": 35,
      "description": "매우 좋은 서비스였습니다!",
      "img1": null,
      "img2": null,
      "img3": null,
      "img4": null,
      "img5": null,
      "likeCount": 0,
      "regDate": "2025-03-30 09:55:12",
      "modDate": "2025-03-30 09:55:12"
    }
  }
  ```

## 신고 API

### 매장 신고
- **URL**: `/reports/shops/:shopId`
- **Method**: `POST`
- **인증 필요**: 예
- **Path Parameters**:
  - `shopId`: 매장 ID
- **Request Body**:
  ```json
  {
    "reportType": "spam", // 가능한 값: "spam", "inappropriate", "fraud", "offensive", "harassment", "others"
    "description": "테스트 신고입니다."
  }
  ```
- **성공 응답 (201)**:
  ```json
  {
    "success": true,
    "data": {
      "targetType": "shop",
      "targetId": 11670753,
      "userId": 35,
      "reportType": "spam",
      "description": "테스트 신고입니다.",
      "status": "pending",
      "regDate": "2025-03-30T09:48:11.302Z",
      "modDate": "2025-03-30T09:48:11.302Z"
    }
  }
  ```

### 댓글 신고
- **URL**: `/reports/comments/:commentId`
- **Method**: `POST`
- **인증 필요**: 예
- **Path Parameters**:
  - `commentId`: 댓글 ID
- **Request Body**:
  ```json
  {
    "reportType": "inappropriate", // 가능한 값: "spam", "inappropriate", "fraud", "offensive", "harassment", "others"
    "description": "부적절한 댓글입니다."
  }
  ```
- **성공 응답 (201)**:
  ```json
  {
    "success": true,
    "data": {
      "targetType": "comment",
      "targetId": 123,
      "userId": 35,
      "reportType": "inappropriate",
      "description": "부적절한 댓글입니다.",
      "status": "pending",
      "regDate": "2025-03-30T09:50:00.000Z",
      "modDate": "2025-03-30T09:50:00.000Z"
    }
  }
  ```

### 내 신고 목록 조회
- **URL**: `/reports/me`
- **Method**: `GET`
- **인증 필요**: 예
- **Query Parameters**:
  - `page`: 페이지 번호 (기본값: 1)
  - `limit`: 페이지당 항목 수 (기본값: 20)
- **성공 응답 (200)**:
  ```json
  {
    "success": true,
    "size": 2,
    "data": [
      {
        "id": 1,
        "targetType": "shop",
        "targetId": 11670753,
        "userId": 35,
        "reportType": "spam",
        "description": "테스트 신고입니다.",
        "status": "pending",
        "adminComment": null,
        "reviewedBy": null,
        "regDate": "2025-03-30 09:48:11",
        "modDate": "2025-03-30 09:48:11",
        "userName": "테스트 사용자",
        "userProfileImage": null,
        "targetTitle": "연희사진관"
      },
      // ... 더 많은 신고 항목
    ]
  }
  ```

### 내 신고 상세 조회
- **URL**: `/reports/me/:reportId`
- **Method**: `GET`
- **인증 필요**: 예
- **Path Parameters**:
  - `reportId`: 신고 ID
- **성공 응답 (200)**:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "targetType": "shop",
      "targetId": 11670753,
      "userId": 35,
      "reportType": "spam",
      "description": "테스트 신고입니다.",
      "status": "pending",
      "adminComment": null,
      "reviewedBy": null,
      "regDate": "2025-03-30 09:48:11",
      "modDate": "2025-03-30 09:48:11",
      "userName": "테스트 사용자",
      "userProfileImage": null,
      "targetTitle": "연희사진관"
    }
  }
  ``` 