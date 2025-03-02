# 프로필 이미지 API 사용 가이드

## 개요

이 문서는 Chaltteok_BE 프로젝트의 프로필 이미지 업로드 및 관리 API 사용법을 설명합니다. 프론트엔드 개발자는 이 가이드를 참고하여 프로필 이미지 기능을 구현할 수 있습니다.

## 기본 URL

```
http://서버주소:9801/api/v1
```

## 인증

모든 API 요청(로그인 제외)은 JWT 토큰을 필요로 합니다. 토큰은 Authorization 헤더에 다음과 같은 형식으로 포함되어야 합니다:

```
Authorization: Bearer {토큰값}
```

## API 엔드포인트

### 1. 로그인

**요청**
```
POST /auth/login
Content-Type: application/json

{
  "email": "사용자이메일",
  "password": "비밀번호"
}
```

**응답**
```json
{
  "success": true,
  "token": "JWT 토큰"
}
```

### 2. 사용자 프로필 조회

**요청**
```
GET /user/me/profile
Authorization: Bearer {토큰값}
```

**응답**
```json
{
  "success": true,
  "profile": {
    "id": "사용자ID",
    "name": "이름",
    "email": "이메일",
    "phone": "전화번호",
    "address": "주소",
    "socialId": "소셜ID(있는 경우)",
    "type": "계정타입",
    "profileImage": "프로필이미지URL(있는 경우)"
  }
}
```

### 3. 프로필 정보 업데이트

**요청**
```
PATCH /user/me/profile
Authorization: Bearer {토큰값}
Content-Type: application/json

{
  "name": "변경할 이름(선택)",
  "phone": "변경할 전화번호(선택)",
  "address": "변경할 주소(선택)",
  "age": 변경할 나이(선택),
  "gender": "변경할 성별(선택)",
  "nickName": "변경할 닉네임(선택)"
}
```

**응답**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": "사용자ID",
    "type": "계정타입",
    "email": "이메일",
    "name": "이름",
    "age": 나이,
    "gender": "성별",
    "nickName": "닉네임",
    "phone": "전화번호",
    "address": "주소",
    "profileImage": "프로필이미지URL(있는 경우)"
  }
}
```

### 4. 프로필 이미지 업로드

**요청**
```
POST /user/me/profile-image
Authorization: Bearer {토큰값}
Content-Type: multipart/form-data

formData:
  - profileImage: (이미지 파일)
```

**응답**
```json
{
  "success": true,
  "message": "프로필 이미지가 업로드되었습니다.",
  "profileImage": "프로필이미지URL"
}
```

### 5. 프로필 이미지 삭제

**요청**
```
DELETE /user/me/profile-image
Authorization: Bearer {토큰값}
```

**응답**
```json
{
  "success": true,
  "message": "프로필 이미지가 삭제되었습니다."
}
```

## 프론트엔드 구현 예시 (React)

### 프로필 이미지 업로드 컴포넌트 예시

```jsx
import React, { useState, useRef } from 'react';
import axios from 'axios';

const ProfileImageUploader = ({ token, onSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    
    const file = fileInputRef.current.files[0];
    if (!file) {
      setError('이미지 파일을 선택해주세요.');
      return;
    }
    
    setUploading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('profileImage', file);
    
    try {
      const response = await axios.post(
        'http://서버주소:9801/api/v1/user/me/profile-image',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (response.data.success) {
        onSuccess(response.data.profileImage);
      } else {
        setError(response.data.message || '업로드에 실패했습니다.');
      }
    } catch (err) {
      setError(err.response?.data?.message || '서버 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="profile-image-uploader">
      <h3>프로필 이미지 업로드</h3>
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleUpload}>
        <input 
          type="file" 
          ref={fileInputRef} 
          accept="image/jpeg,image/png,image/gif,image/webp" 
        />
        <button type="submit" disabled={uploading}>
          {uploading ? '업로드 중...' : '이미지 업로드'}
        </button>
      </form>
    </div>
  );
};

export default ProfileImageUploader;
```

### 프로필 이미지 관리 컴포넌트 예시

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProfileImageUploader from './ProfileImageUploader';

const ProfileManager = ({ token }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        'http://서버주소:9801/api/v1/user/me/profile',
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        setProfile(response.data.profile);
      }
    } catch (err) {
      setError('프로필을 불러오는 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteImage = async () => {
    try {
      setLoading(true);
      const response = await axios.delete(
        'http://서버주소:9801/api/v1/user/me/profile-image',
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        // 프로필 이미지 업데이트
        fetchProfile();
      }
    } catch (err) {
      setError('이미지 삭제 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleImageUploadSuccess = (imageUrl) => {
    setProfile(prev => ({ ...prev, profileImage: imageUrl }));
  };
  
  useEffect(() => {
    fetchProfile();
  }, [token]);
  
  if (loading && !profile) return <div>로딩 중...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!profile) return <div>프로필 정보가 없습니다.</div>;
  
  return (
    <div className="profile-manager">
      <h2>프로필 관리</h2>
      
      <div className="profile-info">
        <div className="profile-image-container">
          {profile.profileImage ? (
            <>
              <img 
                src={profile.profileImage} 
                alt="프로필 이미지" 
                className="profile-image" 
              />
              <button onClick={handleDeleteImage}>이미지 삭제</button>
            </>
          ) : (
            <div className="no-image">이미지 없음</div>
          )}
        </div>
        
        <div className="profile-details">
          <p><strong>이름:</strong> {profile.name}</p>
          <p><strong>이메일:</strong> {profile.email}</p>
          <p><strong>전화번호:</strong> {profile.phone}</p>
          <p><strong>주소:</strong> {profile.address}</p>
        </div>
      </div>
      
      <ProfileImageUploader 
        token={token} 
        onSuccess={handleImageUploadSuccess} 
      />
    </div>
  );
};

export default ProfileManager;
```

## 파일 형식 및 제한 사항

- 지원하는 이미지 형식: JPEG, PNG, GIF, WEBP
- 최대 파일 크기: 5MB

## 에러 처리

API는 오류 발생 시 다음과 같은 형식으로 응답합니다:

```json
{
  "success": false,
  "message": "오류 메시지"
}
```

주요 오류 코드:
- 401: 인증 오류 (토큰 없음 또는 유효하지 않음)
- 404: 리소스를 찾을 수 없음
- 400: 잘못된 요청 (파일 없음, 지원하지 않는 형식 등)
- 500: 서버 오류 