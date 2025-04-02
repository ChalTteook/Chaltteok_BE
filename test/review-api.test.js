import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';

dotenv.config();

// API 베이스 URL
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:9801/api/v1';

// 테스트용 변수
let userToken = '';
let testShopId = 11670753; // 테스트할 상점 ID
let createdReviewId = 0;

// 일반 사용자 로그인
async function userLogin() {
  try {
    console.log('\n--- 일반 사용자 로그인 테스트 ---');
    console.log('로그인 시도 URL:', `${API_BASE_URL}/auth/login`);
    
    // 로그인 요청 데이터 설정
    const loginData = {
      email: 'test@newaccount.com',
      password: 'newpass1234'
    };
    console.log('로그인 요청 데이터:', loginData);
    
    const response = await axios.post(`${API_BASE_URL}/auth/login`, loginData);
    
    // 상세 응답 로깅
    console.log('로그인 응답 상태 코드:', response.status);
    console.log('로그인 응답 헤더:', response.headers);
    console.log('로그인 응답 데이터:', response.data);
    
    if (response.data.success) {
      // 토큰 필드 이름 검사 (token 또는 accessToken)
      if (response.data.token) {
        userToken = response.data.token;
        console.log('사용자 로그인 성공! 토큰 발급 완료 (token 필드 사용)');
      } else if (response.data.accessToken) {
        userToken = response.data.accessToken;
        console.log('사용자 로그인 성공! 토큰 발급 완료 (accessToken 필드 사용)');
      } else {
        console.error('사용자 로그인 성공했지만 토큰이 없습니다.');
        return false;
      }
      
      // 토큰 디코딩 시도 (유효성 확인용)
      try {
        const parts = userToken.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
          console.log('토큰 페이로드:', payload);
        }
      } catch (e) {
        console.log('토큰 디코딩 실패, 형식이 잘못되었을 수 있습니다.');
      }
      
      return true;
    } else {
      console.error('사용자 로그인 실패:', response.data.message);
      return false;
    }
  } catch (error) {
    console.error('사용자 로그인 중 오류 발생:');
    if (error.response) {
      console.error('응답 상태:', error.response.status);
      console.error('응답 데이터:', error.response.data);
    } else if (error.request) {
      console.error('서버로부터 응답이 없습니다. 서버가 실행 중인지 확인하세요.');
    } else {
      console.error('오류 메시지:', error.message);
    }
    return false;
  }
}

// 리뷰 목록 조회 테스트
async function testGetReviews() {
  try {
    console.log('\n--- 리뷰 목록 조회 테스트 ---');
    const response = await axios.get(`${API_BASE_URL}/reviews/shops/${testShopId}`);
    
    if (response.data.success) {
      console.log(`리뷰 목록 조회 성공! 총 ${response.data.data.length}개의 리뷰가 있습니다.`);
      console.log('첫 번째 리뷰:', response.data.data[0]?.description || '리뷰 없음');
      return true;
    } else {
      console.error('리뷰 목록 조회 실패:', response.data.message);
      return false;
    }
  } catch (error) {
    console.error('리뷰 목록 조회 중 오류 발생:', error.response?.data?.message || error.message);
    return false;
  }
}

// 페이지네이션 테스트
async function testPagination() {
  try {
    console.log('\n--- 리뷰 페이지네이션 테스트 ---');
    const page = 1;
    const limit = 1;
    const response = await axios.get(`${API_BASE_URL}/reviews/shops/${testShopId}?page=${page}&limit=${limit}`);
    
    if (response.data.success) {
      console.log(`페이지 ${page}, 항목 수 ${limit} 조회 성공! 결과 수: ${response.data.data.length}`);
      
      // 두 번째 페이지 테스트
      const page2 = 2;
      const response2 = await axios.get(`${API_BASE_URL}/reviews/shops/${testShopId}?page=${page2}&limit=${limit}`);
      
      if (response2.data.success) {
        console.log(`페이지 ${page2}, 항목 수 ${limit} 조회 성공! 결과 수: ${response2.data.data.length}`);
        console.log('두 페이지의 리뷰 ID 비교:', 
          response.data.data[0]?.id !== response2.data.data[0]?.id ? '다른 리뷰입니다 (성공)' : '같은 리뷰입니다 (실패)');
        return true;
      } else {
        console.error('두 번째 페이지 조회 실패:', response2.data.message);
        return false;
      }
    } else {
      console.error('페이지네이션 테스트 실패:', response.data.message);
      return false;
    }
  } catch (error) {
    console.error('페이지네이션 테스트 중 오류 발생:', error.response?.data?.message || error.message);
    return false;
  }
}

// 리뷰 상세 조회 테스트
async function testGetReviewDetail() {
  try {
    console.log('\n--- 리뷰 상세 조회 테스트 ---');
    // 먼저 리뷰 목록을 가져와서 첫 번째 리뷰 ID를 사용
    const listResponse = await axios.get(`${API_BASE_URL}/reviews/shops/${testShopId}`);
    
    if (!listResponse.data.success || !listResponse.data.data.length) {
      console.error('테스트할 리뷰를 찾을 수 없습니다.');
      return false;
    }
    
    const reviewId = listResponse.data.data[0].id;
    const response = await axios.get(`${API_BASE_URL}/reviews/${reviewId}`);
    
    if (response.data.success) {
      console.log(`리뷰 상세 조회 성공! 리뷰 ID: ${reviewId}`);
      console.log('리뷰 내용:', response.data.data.description);
      console.log('상점명:', response.data.data.shopName || '상점명 없음');
      console.log('작성자:', response.data.data.userName || '작성자 정보 없음');
      return true;
    } else {
      console.error('리뷰 상세 조회 실패:', response.data.message);
      return false;
    }
  } catch (error) {
    console.error('리뷰 상세 조회 중 오류 발생:', error.response?.data?.message || error.message);
    return false;
  }
}

// 인증 테스트 (토큰 없이 리뷰 작성 시도)
async function testAuthenticationRequired() {
  try {
    console.log('\n--- 인증 필요 테스트 (토큰 없이 리뷰 작성) ---');
    
    // 인증 없이 리뷰 작성 시도
    try {
      await axios.post(`${API_BASE_URL}/reviews/shops/${testShopId}`, {
        description: '인증 없이 작성하는 테스트 리뷰'
      });
      
      console.error('인증 없이 리뷰 작성이 성공했습니다. (테스트 실패)');
      return false;
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('예상대로 인증 오류가 발생했습니다. (테스트 성공)');
        console.log('오류 메시지:', error.response.data.message);
        return true;
      } else {
        console.error('예상치 않은 오류 발생:', error.response?.data?.message || error.message);
        return false;
      }
    }
  } catch (error) {
    console.error('인증 테스트 중 오류 발생:', error.message);
    return false;
  }
}

// 리뷰 작성 테스트 (인증 필요)
async function testCreateReview() {
  // 로그인이 필요한 작업이므로 토큰을 확인
  if (!userToken) {
    console.log('리뷰 작성을 위해 로그인이 필요합니다. 로그인을 시도합니다...');
    const loginSuccess = await userLogin();
    if (!loginSuccess) {
      console.error('로그인 실패로 리뷰 작성 테스트를 건너뜁니다.');
      return false;
    }
  }
  
  try {
    console.log('\n--- 리뷰 작성 테스트 (인증 포함) ---');
    console.log('사용할 토큰:', userToken);
    
    // 요청 데이터 및 헤더 구성
    const reviewData = {
      description: '테스트 리뷰입니다 ' + Math.floor(Date.now() / 1000)
    };
    
    const headers = {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json'
    };
    console.log('요청 헤더:', headers);
    console.log('요청 데이터:', reviewData);
    console.log('요청 URL:', `${API_BASE_URL}/reviews/shops/${testShopId}`);
    
    // HTTP 요청 실행
    const response = await axios.post(
      `${API_BASE_URL}/reviews/shops/${testShopId}`,
      reviewData,
      { headers }
    );
    
    // 응답 로깅
    console.log('응답 상태 코드:', response.status);
    console.log('응답 데이터:', response.data);
    
    if (response.data.success) {
      // 응답 데이터가 null인 경우 처리
      if (response.data.data === null) {
        console.log('리뷰가 생성되었지만 ID를 반환받지 못했습니다.');
        console.log('리뷰 목록을 조회하여 가장 최근 리뷰를 찾습니다...');
        
        // 리뷰 목록을 조회하여 가장 최근 리뷰 ID 찾기
        const reviewsResponse = await axios.get(`${API_BASE_URL}/reviews/shops/${testShopId}`);
        if (reviewsResponse.data.success && reviewsResponse.data.data.length > 0) {
          createdReviewId = reviewsResponse.data.data[0].id;
          console.log(`가장 최근 리뷰를 찾았습니다. ID: ${createdReviewId}`);
          return true;
        } else {
          console.error('리뷰 목록을 찾을 수 없습니다.');
          return false;
        }
      } else {
        createdReviewId = response.data.data.id;
        console.log(`리뷰 작성 성공! 새 리뷰 ID: ${createdReviewId}`);
        return true;
      }
    } else {
      console.error('리뷰 작성 실패:', response.data.message);
      return false;
    }
  } catch (error) {
    console.error('리뷰 작성 중 오류 발생:');
    if (error.response) {
      console.error('응답 상태:', error.response.status);
      console.error('응답 데이터:', error.response.data);
      console.error('서버 오류 메시지:', error.response.data.message);
    } else if (error.request) {
      console.error('서버로부터 응답이 없습니다.');
    } else {
      console.error('오류 메시지:', error.message);
    }
    return false;
  }
}

// 이미지가 있는 리뷰 작성 테스트
async function testCreateReviewWithImage() {
  // 로그인이 필요한 작업이므로 토큰을 확인
  if (!userToken) {
    console.log('리뷰 작성을 위해 로그인이 필요합니다. 로그인을 시도합니다...');
    const loginSuccess = await userLogin();
    if (!loginSuccess) {
      console.error('로그인 실패로 이미지 리뷰 작성 테스트를 건너뜁니다.');
      return false;
    }
  }
  
  try {
    console.log('\n--- 이미지가 있는 리뷰 작성 테스트 ---');
    
    // 먼저 일반 리뷰 생성
    console.log('첫 번째 단계: 일반 리뷰 생성');
    const reviewResponse = await axios.post(
      `${API_BASE_URL}/reviews/shops/${testShopId}`,
      {
        description: '테스트 이미지 리뷰입니다 ' + Math.floor(Date.now() / 1000)
      },
      {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!reviewResponse.data.success) {
      console.error('리뷰 생성 실패:', reviewResponse.data.message);
      return false;
    }
    
    let newReviewId;
    // 응답 데이터가 null인 경우 처리
    if (reviewResponse.data.data === null) {
      console.log('리뷰가 생성되었지만 ID를 반환받지 못했습니다.');
      console.log('리뷰 목록을 조회하여 가장 최근 리뷰를 찾습니다...');
      
      // 리뷰 목록을 조회하여 가장 최근 리뷰 ID 찾기
      const reviewsResponse = await axios.get(`${API_BASE_URL}/reviews/shops/${testShopId}`);
      if (reviewsResponse.data.success && reviewsResponse.data.data.length > 0) {
        newReviewId = reviewsResponse.data.data[0].id;
        console.log(`가장 최근 리뷰를 찾았습니다. ID: ${newReviewId}`);
      } else {
        console.error('리뷰 목록을 찾을 수 없습니다.');
        return false;
      }
    } else {
      newReviewId = reviewResponse.data.data.id;
    }
    
    console.log(`리뷰 생성 성공! 리뷰 ID: ${newReviewId}`);
    
    // 이미지 파일 준비
    console.log('두 번째 단계: 이미지 업로드');
    
    // 테스트 이미지 경로
    const imagePath = path.join(process.cwd(), 'test', 'test.png');
    let imageBuffer;
    
    // 이미지 파일 존재 여부 확인
    if (fs.existsSync(imagePath)) {
      console.log('기존 테스트 이미지 파일을 사용합니다:', imagePath);
      imageBuffer = fs.readFileSync(imagePath);
    } else {
      console.log('테스트 이미지 파일이 없습니다. 간단한 테스트 이미지를 생성합니다.');
      
      // 간단한 1x1 픽셀 PNG 이미지 (Base64 인코딩)
      const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVQI12P4//8/AAX+Av7czFnnAAAAAElFTkSuQmCC';
      imageBuffer = Buffer.from(base64Image, 'base64');
      
      // 테스트 디렉토리가 없으면 생성
      const testDir = path.join(process.cwd(), 'test');
      if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
      }
      
      // 생성한 이미지 저장 (향후 테스트용)
      fs.writeFileSync(imagePath, imageBuffer);
      console.log('테스트 이미지 생성 완료:', imagePath);
    }
    
    console.log('이미지 파일 크기:', imageBuffer.length, 'bytes');
    
    // FormData 생성
    const formData = new FormData();
    formData.append('image', imageBuffer, {
      filename: 'test.png',
      contentType: 'image/png'
    });
    
    console.log('API 요청 경로:', `${API_BASE_URL}/reviews/${newReviewId}/images?index=1`);
    
    // 요청 헤더 구성
    const uploadHeaders = {
      'Authorization': `Bearer ${userToken}`,
      ...formData.getHeaders()
    };
    
    console.log('업로드 요청 헤더:', uploadHeaders);
    
    try {
      const imageResponse = await axios.post(
        `${API_BASE_URL}/reviews/${newReviewId}/images?index=1`,
        formData,
        { headers: uploadHeaders }
      );
      
      if (imageResponse.data.success) {
        console.log(`이미지 업로드 성공! 이미지 URL: ${imageResponse.data.data?.imageUrl || '(URL 정보 없음)'}`);
        return true;
      } else {
        console.error('이미지 업로드 실패:', imageResponse.data.message);
        return false;
      }
    } catch (imageError) {
      console.error('이미지 업로드 중 오류 발생:');
      if (imageError.response) {
        console.error('응답 상태:', imageError.response.status);
        console.error('응답 데이터:', imageError.response.data);
      } else {
        console.error('오류 메시지:', imageError.message);
      }
      // 이미지 업로드 실패해도 리뷰 생성은 성공했으므로 부분 성공으로 처리
      console.log('리뷰 생성은 성공했지만 이미지 업로드는 실패했습니다.');
      return false;
    }
  } catch (error) {
    console.error('이미지 리뷰 작성 중 오류 발생:');
    if (error.response) {
      console.error('응답 상태:', error.response.status);
      console.error('응답 데이터:', error.response.data);
      console.error('응답 헤더:', error.response.headers);
    } else if (error.request) {
      console.error('서버로부터 응답이 없습니다.');
      console.error('요청 정보:', error.request);
    } else {
      console.error('오류 메시지:', error.message);
      console.error('오류 상세:', error);
    }
    return false;
  }
}

// 모든 테스트 실행
async function runAllTests() {
  console.log('===== 리뷰 API E2E 테스트 시작 =====');
  
  // 먼저 로그인 수행 - 인증이 필요한 테스트를 위해
  let loginSuccess = await userLogin();
  if (!loginSuccess) {
    console.log('로그인 시도를 한 번 더 진행합니다...');
    loginSuccess = await userLogin();
    if (!loginSuccess) {
      console.error('로그인 실패로 인증이 필요한 테스트가 실패할 수 있습니다.');
    }
  }
  
  // 테스트 결과 저장
  const results = {
    getReviews: await testGetReviews(),
    pagination: await testPagination(),
    getReviewDetail: await testGetReviewDetail(),
    authenticationRequired: await testAuthenticationRequired(),
    // 인증이 필요한 테스트 포함하여 실행
    createReview: await testCreateReview(),
    createReviewWithImage: await testCreateReviewWithImage()
  };
  
  // 결과 요약
  console.log('\n===== 테스트 결과 요약 =====');
  for (const [test, result] of Object.entries(results)) {
    console.log(`${test}: ${result === true ? '✅ 성공' : result === 'SKIPPED' ? '⏭️ 건너뜀' : '❌ 실패'}`);
  }
  
  // 종합 결과
  const failedTests = Object.values(results).filter(r => r === false).length;
  const skippedTests = Object.values(results).filter(r => r === 'SKIPPED').length;
  const passedTests = Object.values(results).filter(r => r === true).length;
  
  console.log(`\n총 테스트: ${Object.keys(results).length}`);
  console.log(`통과: ${passedTests}`);
  console.log(`실패: ${failedTests}`);
  console.log(`건너뜀: ${skippedTests}`);
  
  if (failedTests === 0 && skippedTests === 0) {
    console.log('\n🎉 모든 테스트가 성공적으로 완료되었습니다! 🎉');
  } else if (failedTests === 0) {
    console.log('\n✅ 실행된 모든 테스트가 성공했습니다. (일부 테스트는 건너뜀)');
  } else {
    console.log('\n❌ 일부 테스트가 실패했습니다. 로그를 확인해주세요.');
  }
}

// 테스트 실행
runAllTests().catch(error => {
  console.error('테스트 실행 중 예상치 못한 오류가 발생했습니다:', error);
}); 