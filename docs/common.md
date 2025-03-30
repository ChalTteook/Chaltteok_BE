# 찰떡 API - 공통 사항

## 개요
이 문서는 찰떡 서비스 API의 공통 사항을 설명합니다.

## 기본 URL
```
http://localhost:9801/api/v1
```

## 응답 형식
모든 API 응답은 다음 형식을 따릅니다:
```json
{
  "success": true/false,
  "data": {}, // 또는 배열 (성공 시)
  "message": "오류 메시지" // 실패 시
}
```

## 인증
인증이 필요한 API의 경우, 요청 헤더에 JWT 토큰을 포함해야 합니다:
```
Authorization: Bearer {token}
```

## 상태 코드
API는 다음과 같은 HTTP 상태 코드를 사용합니다:

- `200 OK`: 요청이 성공적으로 처리됨
- `201 Created`: 리소스가 성공적으로 생성됨
- `400 Bad Request`: 유효하지 않은 요청
- `401 Unauthorized`: 인증 실패
- `403 Forbidden`: 권한 없음
- `404 Not Found`: 리소스를 찾을 수 없음
- `500 Internal Server Error`: 서버 오류
``` 