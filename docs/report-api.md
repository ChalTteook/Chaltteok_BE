# 찰떡 API - 신고

## 개요
이 문서는 찰떡 서비스의 신고 관련 API를 설명합니다.

## 공통 사항
API 공통 사항은 [공통 문서](./common.md)를 참조하세요.

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