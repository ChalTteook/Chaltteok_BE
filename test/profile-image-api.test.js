import axios from 'axios';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 테스트 환경 설정
const API_BASE_URL = 'http://localhost:9801/api/v1';
let authToken = ''; // 여기에 유효한 JWT 토큰을 넣으세요
let uploadedImageUrl = null;

// 로그인 함수 (토큰 획득)
const login = async () => {
  try {
    console.log('로그인 시도 중...');
    console.log('요청 URL:', `${API_BASE_URL}/auth/login`);
    console.log('요청 데이터:', { email: 'test@b.com', password: 'test1234' });
    
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'test2@b.com',  // 사용자가 제공한 로그인 정보
      password: 'test1234'  // 사용자가 제공한 로그인 정보
    });
    
    console.log('응답 데이터:', response.data);
    
    if (response.data.success && response.data.token) {
      authToken = response.data.token;
      console.log('로그인 성공, 토큰 획득:', authToken);
      return true;
    } else {
      console.error('로그인 실패:', response.data);
      return false;
    }
  } catch (error) {
    console.error('로그인 오류:');
    if (error.response) {
      // 서버 응답이 있는 경우
      console.error('응답 상태:', error.response.status);
      console.error('응답 데이터:', error.response.data);
    } else if (error.request) {
      // 요청은 보냈지만 응답이 없는 경우
      console.error('서버로부터 응답이 없습니다. 서버가 실행 중인지 확인하세요.');
    } else {
      // 요청 설정 중 오류 발생
      console.error('오류 메시지:', error.message);
    }
    return false;
  }
};

// 프로필 정보 조회
const getProfile = async () => {
  try {
    console.log('\n프로필 정보 조회 중...');
    const response = await axios.get(`${API_BASE_URL}/user/me/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('프로필 정보 조회 성공:');
    console.log(JSON.stringify(response.data, null, 2));
    
    return response.data.success ? response.data.profile : null;
  } catch (error) {
    console.error('프로필 조회 오류:', error.response?.data || error.message);
    return null;
  }
};

// 프로필 이미지 업로드 테스트
const uploadProfileImage = async () => {
  try {
    console.log('\n프로필 이미지 업로드 테스트 중...');
    
    // 테스트 이미지 파일 경로 (테스트 디렉토리에 테스트 이미지를 추가해야 합니다)
    const testImagePath = path.join(__dirname, 'test.png');
    
    // 파일이 없으면 에러 처리
    if (!fs.existsSync(testImagePath)) {
      console.error(`테스트 이미지 파일이 없습니다: ${testImagePath}`);
      return false;
    }
    
    // FormData 생성 및 이미지 파일 추가
    const formData = new FormData();
    formData.append('profileImage', fs.createReadStream(testImagePath));
    
    // 요청 보내기
    const response = await axios.post(
      `${API_BASE_URL}/user/me/profile-image`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          ...formData.getHeaders()
        }
      }
    );
    
    console.log('프로필 이미지 업로드 응답:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.success && response.data.profileImage) {
      uploadedImageUrl = response.data.profileImage;
      return true;
    }
    return false;
  } catch (error) {
    console.error('프로필 이미지 업로드 오류:', error.response?.data || error.message);
    return false;
  }
};

// 프로필 이미지 삭제 테스트
const deleteProfileImage = async () => {
  try {
    console.log('\n프로필 이미지 삭제 테스트 중...');
    
    const response = await axios.delete(
      `${API_BASE_URL}/user/me/profile-image`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    console.log('프로필 이미지 삭제 응답:');
    console.log(JSON.stringify(response.data, null, 2));
    
    return response.data.success;
  } catch (error) {
    console.error('프로필 이미지 삭제 오류:', error.response?.data || error.message);
    return false;
  }
};

// 프로필 정보 업데이트 테스트
const updateProfile = async () => {
  try {
    console.log('\n프로필 정보 업데이트 테스트 중...');
    
    const updateData = {
      name: '테스트 사용자',
      phone: '01012345678',
      address: '서울시 강남구',
      age: 30,
      gender: 'M',
      nickName: '테스트닉네임'
    };
    
    const response = await axios.patch(
      `${API_BASE_URL}/user/me/profile`,
      updateData,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    console.log('프로필 업데이트 응답:');
    console.log(JSON.stringify(response.data, null, 2));
    
    return response.data.success;
  } catch (error) {
    console.error('프로필 업데이트 오류:', error.response?.data || error.message);
    return false;
  }
};

// 모든 테스트 실행
const runAllTests = async () => {
  console.log('===== 프로필 이미지 API 테스트 시작 =====');
  
  // 1. 로그인 테스트
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.error('로그인 실패. 테스트를 중단합니다.');
    return;
  }
  
  // 2. 초기 프로필 정보 조회
  console.log('\n----- 초기 프로필 정보 -----');
  await getProfile();
  
  // 3. 프로필 정보 업데이트 테스트
  console.log('\n----- 프로필 정보 업데이트 테스트 -----');
  const updateSuccess = await updateProfile();
  console.log('프로필 업데이트 결과:', updateSuccess ? '성공' : '실패');
  
  // 4. 업데이트 후 프로필 정보 조회
  console.log('\n----- 업데이트 후 프로필 정보 -----');
  await getProfile();
  
  // 5. 프로필 이미지 업로드 테스트
  console.log('\n----- 프로필 이미지 업로드 테스트 -----');
  const uploadSuccess = await uploadProfileImage();
  console.log('이미지 업로드 결과:', uploadSuccess ? '성공' : '실패');
  
  // 6. 이미지 업로드 후 프로필 정보 조회
  console.log('\n----- 이미지 업로드 후 프로필 정보 -----');
  await getProfile();
  
  // 7. 프로필 이미지 삭제 테스트
  console.log('\n----- 프로필 이미지 삭제 테스트 -----');
  const deleteSuccess = await deleteProfileImage();
  console.log('이미지 삭제 결과:', deleteSuccess ? '성공' : '실패');
  
  // 8. 이미지 삭제 후 프로필 정보 조회
  console.log('\n----- 이미지 삭제 후 프로필 정보 -----');
  await getProfile();
  
  console.log('\n===== 프로필 이미지 API 테스트 완료 =====');
};

// 테스트 실행
runAllTests().catch(error => {
  console.error('테스트 실행 중 오류 발생:', error);
}); 