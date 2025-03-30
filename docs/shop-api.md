# 찰떡 API - 매장

## 개요
이 문서는 찰떡 서비스의 매장 정보 관련 API를 설명합니다.

## 공통 사항
API 공통 사항은 [공통 문서](./common.md)를 참조하세요.

## 매장 API

### 매장 목록 조회
- **URL**: `/shops`
- **Method**: `GET`
- **인증 필요**: 아니오
- **Query Parameters**:
  - `page`: 페이지 번호 (기본값: 1)
  - `limit`: 페이지당 항목 수 (기본값: 20)
  - `sort`: 정렬 기준 (price, review)
  - `partner_only`: 제휴매장만 표시 (true/false)
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