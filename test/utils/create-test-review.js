import axios from 'axios';
import dotenv from 'dotenv';

// 환경 변수 로드
dotenv.config();

// API 기본 URL 설정
const API_BASE_URL = 'http://localhost:9801/api/v1';

// 테스트 변수
let authToken = null;
let createdReviewId = null;

// 로그인 함수 (토큰 획득)
const login = async () => {
  try {
    console.log('로그인 중...');
    
    const loginData = {
      email: 'test@newaccount.com', // 테스트 계정 정보
      password: 'newpass1234'
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

// 테스트 리뷰 생성 (리뷰 API가 있다고 가정)
const createTestReview = async () => {
  try {
    console.log('\n테스트 리뷰 생성 중...');
    
    // 기본적인 리뷰 데이터
    const reviewData = {
      shopId: 1, // 테스트용 상점 ID
      shopPrdId: 1, // 테스트용 상품 ID
      description: '테스트 리뷰입니다. ' + new Date().toISOString()
    };
    
    const response = await axios.post(
      `${API_BASE_URL}/shops/review`,
      reviewData,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    if (response.data.success && response.data.data) {
      createdReviewId = response.data.data.reviewId;
      console.log('테스트 리뷰가 성공적으로 생성되었습니다. ID:', createdReviewId);
      return createdReviewId;
    } else {
      console.error('테스트 리뷰 생성 실패');
      return null;
    }
  } catch (error) {
    // 리뷰 API가 없거나 다른 구조일 경우를 대비해 오류 처리
    console.error('테스트 리뷰 생성 중 오류 발생:', error.response?.data || error.message);
    
    // 오류 발생 시, MySQL에 직접 삽입하는 방법을 안내
    console.log('\n리뷰 API 사용이 불가능할 경우, 다음 SQL을 실행하여 테스트 리뷰를 생성할 수 있습니다:');
    console.log(`
    INSERT INTO shop_review (
      shop_id, 
      shop_prd_id, 
      user_id, 
      description, 
      like_count, 
      reg_date, 
      mod_date
    ) 
    VALUES (
      1, 
      1, 
      1, 
      '테스트 리뷰입니다.', 
      0, 
      NOW(), 
      NOW()
    );
    `);
    
    // 테스트용 리뷰 ID를 1로 가정하고 진행
    console.log('\n테스트를 위해 리뷰 ID를 1로 가정하고 계속 진행합니다.');
    console.log('만약 다른 리뷰 ID를 사용하려면 test/comment-image-test.js 파일을 수정하십시오.');
    
    return null;
  }
};

// 메인 함수
const main = async () => {
  // 로그인
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.error('로그인 실패, 테스트 데이터 생성을 중단합니다.');
    return;
  }
  
  // 테스트 리뷰 생성
  const reviewId = await createTestReview();
  
  // 생성된 리뷰 ID가 있을 경우 정보 출력
  if (reviewId) {
    console.log(`\n생성된 테스트 리뷰 ID: ${reviewId}`);
    console.log(`이 ID를 test/comment-image-test.js 파일의 testReviewId 변수에 설정하십시오.`);
  }
};

// 스크립트 실행
main().catch(error => {
  console.error('테스트 데이터 생성 중 오류 발생:', error);
}); 