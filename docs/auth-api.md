# 찰떡 API - 인증

## 개요
이 문서는 찰떡 서비스의 사용자 인증과 관련된 API를 설명합니다.

## 공통 사항
API 공통 사항은 [공통 문서](./common.md)를 참조하세요.

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

### 소셜 로그인 인증 URL 획득
- **URL**: `/auth/kakao_auth`
- **Method**: `GET`
- **인증 필요**: 아니오
- **성공 응답 (200)**:
  ```json
  {
    "success": true,
    "data": "https://accounts.kakao.com/login?continue=https%3A%2F%2Fkauth.kakao.com%2Foauth%2Fauthorize%3F..."
  }
  ```

### 소셜 로그인 처리
- **URL**: `/auth/social-login`
- **Method**: `POST`
- **인증 필요**: 아니오
- **Request Body**:
  ```json
  {
    "provider": "kakao",
    "code": "인증_코드"
  }
  ```
- **성공 응답 (200)**:
  ```json
  {
    "success": true,
    "user": {
      "id": 36,
      "type": "kakao",
      "email": "user@example.com",
      "name": "카카오 사용자",
      "phone": null,
      "address": null,
      "profileImage": "https://..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ``` 