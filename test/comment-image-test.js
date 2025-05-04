import axios from 'axios';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import { fileURLToPath } from 'url';

// 현재 파일의 디렉토리 경로 가져오기
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// API 기본 URL 설정
const API_BASE_URL = 'http://localhost:9801/api/v1';

// 테스트 변수
let authToken = null;
let testReviewId = 1; // 테스트할 리뷰 ID (존재하는 리뷰ID로 변경 필요)
let createdCommentId = null;

// 로그인 함수 (토큰 획득)
const login = async () => {
  try {
    console.log('로그인 중...');
    
    const loginData = {
      email: 'admin@test.com', // 테스트 계정 정보
      password: 'test1234'
    };
    
    const response = await axios.post(
      `${API_BASE_URL}/auth/login`,
      loginData
    );
    
    if (response.data.success) {
      authToken = response.data.token;
      console.log('로그인 성공:', authToken.substring(0, 15) + '...');
      return true;
    } else {
      console.error('로그인 실패:', response.data.message);
      return false;
    }
  } catch (error) {
    console.error('로그인 중 오류 발생:', error.response?.data || error.message);
    return false;
  }
};

// 댓글 생성 테스트
const testCreateComment = async () => {
  try {
    console.log('\n댓글 생성 테스트 중...');
    
    const commentData = {
      content: '테스트 댓글입니다. ' + new Date().toISOString()
    };
    
    const response = await axios.post(
      `${API_BASE_URL}/reviews/${testReviewId}/comments`,
      commentData,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    console.log('댓글 생성 응답:', response.data);
    
    if (response.data.success && response.data.data.comment) {
      createdCommentId = response.data.data.comment.id;
      console.log('댓글이 성공적으로 생성되었습니다. ID:', createdCommentId);
      return true;
    } else {
      console.log('댓글 생성 실패');
      return false;
    }
  } catch (error) {
    console.error('댓글 생성 중 오류 발생:', error.response?.data || error.message);
    return false;
  }
};

// 댓글 목록 조회 테스트
const testGetComments = async () => {
  try {
    console.log('\n댓글 목록 조회 테스트 중...');
    
    const response = await axios.get(
      `${API_BASE_URL}/reviews/${testReviewId}/comments`
    );
    
    console.log('댓글 목록 응답:', response.data);
    
    if (response.data.success) {
      console.log(`총 ${response.data.data.comments.length}개의 댓글이 조회되었습니다.`);
      return true;
    } else {
      console.log('댓글 목록 조회 실패');
      return false;
    }
  } catch (error) {
    console.error('댓글 목록 조회 중 오류 발생:', error.response?.data || error.message);
    return false;
  }
};

// 이미지 업로드 테스트
const testUploadImage = async (imagePath, imageIndex) => {
  try {
    console.log(`\n이미지 업로드 테스트 중... (인덱스: ${imageIndex})`);
    
    if (!fs.existsSync(imagePath)) {
      console.error('테스트 이미지 파일이 존재하지 않습니다:', imagePath);
      return false;
    }
    
    const form = new FormData();
    form.append('image', fs.createReadStream(imagePath));
    
    const response = await axios.post(
      `${API_BASE_URL}/reviews/${testReviewId}/images?index=${imageIndex}`,
      form,
      {
        headers: { 
          ...form.getHeaders(),
          Authorization: `Bearer ${authToken}` 
        }
      }
    );
    
    console.log('이미지 업로드 응답:', response.data);
    
    if (response.data.success) {
      console.log('이미지 업로드 성공:', response.data.data.imageUrl);
      return true;
    } else {
      console.log('이미지 업로드 실패');
      return false;
    }
  } catch (error) {
    console.error('이미지 업로드 중 오류 발생:', error.response?.data || error.message);
    return false;
  }
};

// 이미지 삭제 테스트
const testDeleteImage = async (imageIndex) => {
  try {
    console.log(`\n이미지 삭제 테스트 중... (인덱스: ${imageIndex})`);
    
    const response = await axios.delete(
      `${API_BASE_URL}/reviews/${testReviewId}/images/${imageIndex}`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    console.log('이미지 삭제 응답:', response.data);
    
    if (response.data.success) {
      console.log('이미지 삭제 성공');
      return true;
    } else {
      console.log('이미지 삭제 실패');
      return false;
    }
  } catch (error) {
    console.error('이미지 삭제 오류:', error.response?.data || error.message);
    return false;
  }
};

// 댓글 수정 테스트
const testUpdateComment = async () => {
  try {
    console.log('\n댓글 수정 테스트 중...');
    
    if (!createdCommentId) {
      console.error('수정할 댓글 ID가 없습니다.');
      return false;
    }
    
    const updateData = {
      content: '수정된 테스트 댓글입니다. ' + new Date().toISOString()
    };
    
    const response = await axios.put(
      `${API_BASE_URL}/comments/${createdCommentId}`,
      updateData,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    console.log('댓글 수정 응답:', response.data);
    
    if (response.data.success) {
      console.log('댓글 수정 성공');
      return true;
    } else {
      console.log('댓글 수정 실패');
      return false;
    }
  } catch (error) {
    console.error('댓글 수정 오류:', error.response?.data || error.message);
    return false;
  }
};

// 댓글 삭제 테스트
const testDeleteComment = async () => {
  try {
    console.log('\n댓글 삭제 테스트 중...');
    
    if (!createdCommentId) {
      console.error('삭제할 댓글 ID가 없습니다.');
      return false;
    }
    
    const response = await axios.delete(
      `${API_BASE_URL}/comments/${createdCommentId}`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    console.log('댓글 삭제 응답:', response.data);
    
    if (response.data.success) {
      console.log('댓글 삭제 성공');
      return true;
    } else {
      console.log('댓글 삭제 실패');
      return false;
    }
  } catch (error) {
    console.error('댓글 삭제 오류:', error.response?.data || error.message);
    return false;
  }
};

// 모든 테스트 실행
const runAllTests = async () => {
  console.log('===== 댓글 및 이미지 기능 API 테스트 =====');
  
  // 테스트 이미지 파일 생성
  const testImagePath = path.join(__dirname, 'test.png');
  
  // 간단한 테스트 이미지가 없을 경우 더미 이미지 생성
  if (!fs.existsSync(testImagePath)) {
    console.log('테스트 이미지 생성 중...');
    // 1x1 투명 PNG 이미지 데이터
    const base64Data = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    fs.writeFileSync(testImagePath, Buffer.from(base64Data, 'base64'));
    console.log('테스트 이미지가 생성되었습니다:', testImagePath);
  }
  
  // 1. 로그인
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.error('로그인 실패, 테스트를 중단합니다.');
    return;
  }
  
  // 2. 댓글 작성 테스트
  const createSuccess = await testCreateComment();
  if (!createSuccess) {
    console.error('댓글 작성 실패, 다음 테스트를 건너뜁니다.');
  }
  
  // 3. 댓글 조회 테스트
  await testGetComments();
  
  // 4. 댓글 수정 테스트
  if (createdCommentId) {
    await testUpdateComment();
  }
  
  // 5. 이미지 업로드 테스트
  await testUploadImage(testImagePath, 1); // 첫 번째 이미지 슬롯에 업로드
  
  // 6. 이미지 교체 테스트 (동일한 인덱스에 새 이미지 업로드)
  await testUploadImage(testImagePath, 1);
  
  // 7. 두 번째 이미지 업로드 테스트
  await testUploadImage(testImagePath, 2);
  
  // 8. 이미지 삭제 테스트
  await testDeleteImage(2); // 두 번째 이미지 삭제
  
  // 9. 댓글 삭제 테스트
  if (createdCommentId) {
    await testDeleteComment();
  }
  
  console.log('\n===== 댓글 및 이미지 기능 API 테스트 완료 =====');
};

// 테스트 실행
runAllTests().catch(error => {
  console.error('테스트 실행 중 오류 발생:', error);
}); 