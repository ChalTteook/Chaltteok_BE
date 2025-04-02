import axios from 'axios';
import dotenv from 'dotenv';

// 환경 변수 로드
dotenv.config({ path: './test/.env.test' });

// 테스트 환경 설정
const API_BASE_URL = 'http://localhost:9801/api/v1';
let userToken = ''; // 일반 사용자 토큰
let adminToken = ''; // 관리자 토큰
let testReportId = null; // 테스트용 생성된 신고 ID

// 일반 사용자 로그인 함수
const userLogin = async () => {
  try {
    console.log('일반 사용자 로그인 시도 중...');
    
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: process.env.TEST_USER_EMAIL || 'test@newaccount.com',
      password: process.env.TEST_USER_PASSWORD || 'newpass1234'
    });
    
    console.log('로그인 응답:', JSON.stringify(response.data));
    
    if (response.data.success) {
      if (response.data.token) {
        userToken = response.data.token;
        console.log('일반 사용자 로그인 성공, 토큰 획득:', userToken);
        return true;
      } else {
        console.error('토큰 필드가 없습니다:', response.data);
        return false;
      }
    } else {
      console.error('일반 사용자 로그인 실패:', response.data);
      return false;
    }
  } catch (error) {
    console.error('일반 사용자 로그인 오류:', error.response?.data?.message || error.message);
    return false;
  }
};

// 관리자 로그인 함수
const adminLogin = async () => {
  try {
    console.log('관리자 로그인 시도 중...');
    
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: process.env.TEST_ADMIN_EMAIL || 'admin@test.com',
      password: process.env.TEST_ADMIN_PASSWORD || 'test1234'
    });
    
    console.log('관리자 로그인 응답:', JSON.stringify(response.data));
    
    if (response.data.success) {
      if (response.data.token) {
        adminToken = response.data.token;
        console.log('관리자 로그인 성공, 토큰 획득:', adminToken);
        return true;
      } else {
        console.error('관리자 토큰 필드가 없습니다:', response.data);
        return false;
      }
    } else {
      console.error('관리자 로그인 실패:', response.data);
      return false;
    }
  } catch (error) {
    console.error('관리자 로그인 오류:', error.response?.data?.message || error.message);
    return false;
  }
};

// 샵 ID 가져오기 - 테스트용
const getTestShopId = async () => {
  try {
    console.log('테스트용 샵 ID 가져오는 중...');
    
    const response = await axios.get(`${API_BASE_URL}/shops?limit=1`);
    
    if (response.data.success && response.data.data.length > 0) {
      const shopId = response.data.data[0].id;
      console.log('테스트용 샵 ID 획득:', shopId);
      return shopId;
    } else {
      console.error('샵 ID 가져오기 실패:', response.data);
      return null;
    }
  } catch (error) {
    console.error('샵 ID 가져오기 오류:', error.message);
    return null;
  }
};

// 1. 샵 신고 테스트
const testCreateShopReport = async () => {
  try {
    console.log('\n샵 신고 생성 테스트 중...');
    
    const shopId = await getTestShopId();
    if (!shopId) {
      console.error('테스트용 샵 ID를 가져오지 못했습니다.');
      return false;
    }
    
    const reportData = {
      reportType: 'inappropriate',
      description: '테스트 신고입니다.'
    };
    
    console.log('신고 데이터:', reportData);
    
    const response = await axios.post(
      `${API_BASE_URL}/reports/shops/${shopId}`,
      reportData,
      {
        headers: { Authorization: `Bearer ${userToken}` }
      }
    );
    
    console.log('신고 생성 응답:', response.data);
    
    if (response.data.success && response.data.data.id) {
      testReportId = response.data.data.id;
      console.log('신고 생성 성공, 신고 ID:', testReportId);
      return true;
    } else {
      console.error('신고 생성 실패:', response.data);
      return false;
    }
  } catch (error) {
    console.error('신고 생성 오류:');
    if (error.response) {
      console.error('응답 상태:', error.response.status);
      console.error('응답 데이터:', error.response.data);
    } else {
      console.error('오류 메시지:', error.message);
    }
    return false;
  }
};

// 2. 내 신고 목록 조회 테스트
const testGetUserReports = async () => {
  try {
    console.log('\n내 신고 목록 조회 테스트 중...');
    
    const response = await axios.get(
      `${API_BASE_URL}/reports/me`,
      {
        headers: { Authorization: `Bearer ${userToken}` }
      }
    );
    
    console.log('내 신고 목록 조회 응답:', response.data);
    
    if (response.data.success) {
      console.log('내 신고 목록 조회 성공, 신고 개수:', response.data.size);
      return true;
    } else {
      console.error('내 신고 목록 조회 실패:', response.data);
      return false;
    }
  } catch (error) {
    console.error('내 신고 목록 조회 오류:', error.message);
    return false;
  }
};

// 3. 내 신고 상세 조회 테스트
const testGetUserReport = async () => {
  try {
    console.log('\n내 신고 상세 조회 테스트 중...');
    
    if (!testReportId) {
      console.error('테스트용 신고 ID가 없습니다.');
      return false;
    }
    
    const response = await axios.get(
      `${API_BASE_URL}/reports/me/${testReportId}`,
      {
        headers: { Authorization: `Bearer ${userToken}` }
      }
    );
    
    console.log('내 신고 상세 조회 응답:', response.data);
    
    if (response.data.success) {
      console.log('내 신고 상세 조회 성공');
      return true;
    } else {
      console.error('내 신고 상세 조회 실패:', response.data);
      return false;
    }
  } catch (error) {
    console.error('내 신고 상세 조회 오류:', error.message);
    return false;
  }
};

// 4. 관리자 전체 신고 목록 조회 테스트
const testAdminGetAllReports = async () => {
  try {
    console.log('\n관리자 전체 신고 목록 조회 테스트 중...');
    
    const response = await axios.get(
      `${API_BASE_URL}/admin/reports`,
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );
    
    console.log('전체 신고 목록 조회 응답:', response.data);
    
    if (response.data.success) {
      console.log('전체 신고 목록 조회 성공, 신고 개수:', response.data.size);
      return true;
    } else {
      console.error('전체 신고 목록 조회 실패:', response.data);
      return false;
    }
  } catch (error) {
    console.error('전체 신고 목록 조회 오류:', error.message);
    return false;
  }
};

// 5. 관리자 신고 상세 조회 테스트
const testAdminGetReport = async () => {
  try {
    console.log('\n관리자 신고 상세 조회 테스트 중...');
    
    if (!testReportId) {
      console.error('테스트용 신고 ID가 없습니다.');
      return false;
    }
    
    const response = await axios.get(
      `${API_BASE_URL}/admin/reports/${testReportId}`,
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );
    
    console.log('관리자 신고 상세 조회 응답:', response.data);
    
    if (response.data.success) {
      console.log('관리자 신고 상세 조회 성공');
      return true;
    } else {
      console.error('관리자 신고 상세 조회 실패:', response.data);
      return false;
    }
  } catch (error) {
    console.error('관리자 신고 상세 조회 오류:', error.message);
    return false;
  }
};

// 6. 관리자 신고 상태 업데이트 테스트
const testAdminUpdateReportStatus = async () => {
  try {
    console.log('\n관리자 신고 상태 업데이트 테스트 중...');
    
    if (!testReportId) {
      console.error('테스트용 신고 ID가 없습니다.');
      return false;
    }
    
    const updateData = {
      status: 'in_review',
      adminComment: '테스트 코멘트입니다.'
    };
    
    const response = await axios.put(
      `${API_BASE_URL}/admin/reports/${testReportId}/status`,
      updateData,
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );
    
    console.log('신고 상태 업데이트 응답:', response.data);
    
    if (response.data.success) {
      console.log('신고 상태 업데이트 성공');
      return true;
    } else {
      console.error('신고 상태 업데이트 실패:', response.data);
      return false;
    }
  } catch (error) {
    console.error('신고 상태 업데이트 오류:', error.message);
    return false;
  }
};

// 7. 관리자 신고 통계 조회 테스트
const testAdminGetReportStats = async () => {
  try {
    console.log('\n관리자 신고 통계 조회 테스트 중...');
    
    const response = await axios.get(
      `${API_BASE_URL}/admin/reports/stats`,
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );
    
    console.log('신고 통계 조회 응답:', response.data);
    
    if (response.data.success) {
      console.log('신고 통계 조회 성공');
      return true;
    } else {
      console.error('신고 통계 조회 실패:', response.data);
      return false;
    }
  } catch (error) {
    console.error('신고 통계 조회 오류:', error.message);
    return false;
  }
};

// 모든 테스트 실행
const runAllTests = async () => {
  console.log('==========================================');
  console.log('신고 기능 API 테스트 시작');
  console.log('==========================================');
  
  // 로그인 테스트
  const userLoginSuccess = await userLogin();
  if (!userLoginSuccess) {
    console.error('일반 사용자 로그인에 실패하여 테스트를 중단합니다.');
    return;
  }
  
  const adminLoginSuccess = await adminLogin();
  if (!adminLoginSuccess) {
    console.error('관리자 로그인에 실패하여 테스트를 중단합니다.');
    return;
  }
  
  // 사용자 테스트
  console.log('\n=== 일반 사용자 API 테스트 ===');
  const createReportSuccess = await testCreateShopReport();
  if (!createReportSuccess) {
    console.error('신고 생성에 실패하여 이후 테스트를 중단합니다.');
    return;
  }
  
  await testGetUserReports();
  await testGetUserReport();
  
  // 관리자 테스트
  console.log('\n=== 관리자 API 테스트 ===');
  await testAdminGetAllReports();
  await testAdminGetReport();
  await testAdminUpdateReportStatus();
  await testAdminGetReportStats();
  
  console.log('\n==========================================');
  console.log('신고 기능 API 테스트 완료');
  console.log('==========================================');
};

// 테스트 실행
runAllTests(); 