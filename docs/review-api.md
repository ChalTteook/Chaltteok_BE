# 찰떡 API - 리뷰

## 개요
이 문서는 찰떡 서비스의 리뷰 관련 API를 설명합니다.

## 공통 사항
API 공통 사항은 [공통 문서](./common.md)를 참조하세요.

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

### 리뷰 수정
- **URL**: `/reviews/shops/:shopId/reviews/:reviewId`
- **Method**: `PUT`
- **인증 필요**: 예
- **Path Parameters**:
  - `shopId`: 매장 ID
  - `reviewId`: 리뷰 ID
- **Request Body**:
  ```json
  {
    "description": "수정된 리뷰 내용입니다."
  }
  ```
- **성공 응답 (200)**:
  ```json
  {
    "success": true,
    "data": {
      "id": 47,
      "shopId": 11670753,
      "userId": 35,
      "description": "수정된 리뷰 내용입니다.",
      "img1": null,
      "img2": null,
      "img3": null,
      "img4": null,
      "img5": null,
      "likeCount": 0,
      "regDate": "2025-03-30 09:55:12",
      "modDate": "2025-03-30 10:05:45"
    }
  }
  ```

### 리뷰 삭제
- **URL**: `/reviews/shops/:shopId/reviews/:reviewId`
- **Method**: `DELETE`
- **인증 필요**: 예
- **Path Parameters**:
  - `shopId`: 매장 ID
  - `reviewId`: 리뷰 ID
- **성공 응답 (200)**:
  ```json
  {
    "success": true,
    "message": "리뷰가 성공적으로 삭제되었습니다."
  }
  ```

### 리뷰 이미지 업로드
- **URL**: `/reviews/:reviewId/images`
- **Method**: `POST`
- **인증 필요**: 예
- **Path Parameters**:
  - `reviewId`: 리뷰 ID
- **Request Body**: `multipart/form-data`
  - `image`: 이미지 파일
- **성공 응답 (200)**:
  ```json
  {
    "success": true,
    "data": {
      "imageUrl": "/uploads/review-images/47_1_ac77ea01-d8d7-478d-8dab-d1473e804d07.png"
    }
  }
  ```

### 리뷰 이미지 삭제
- **URL**: `/reviews/:reviewId/images/:imageIndex`
- **Method**: `DELETE`
- **인증 필요**: 예
- **Path Parameters**:
  - `reviewId`: 리뷰 ID
  - `imageIndex`: 이미지 인덱스 (1-5)
- **성공 응답 (200)**:
  ```json
  {
    "success": true,
    "message": "이미지가 성공적으로 삭제되었습니다."
  }
  ```

### 리뷰 좋아요
- **URL**: `/reviews/shops/:shopId/reviews/:reviewId/like`
- **Method**: `POST`
- **인증 필요**: 예
- **Path Parameters**:
  - `shopId`: 매장 ID
  - `reviewId`: 리뷰 ID
- **성공 응답 (200)**:
  ```json
  {
    "success": true,
    "data": {
      "likeCount": 1
    }
  }
  ```
``` 