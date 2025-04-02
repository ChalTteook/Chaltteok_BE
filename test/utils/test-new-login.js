import axios from 'axios';

// 테스트 환경 설정
const API_BASE_URL = 'http://localhost:9801/api/v1';
let authToken = ''; // 로그인 후 토큰을 저장할 변수

// 로그인 함수
const login = async () => {
  try {
    console.log('새 계정 로그인 시도 중...');
    console.log('요청 URL:', `${API_BASE_URL}/auth/login`);
    console.log('요청 데이터:', { email: 'test@newaccount.com', password: 'newpass1234' });
    
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'test@newaccount.com',
      password: 'newpass1234'
    });
    
    console.log('응답 데이터:', response.data);
    
    if (response.data.success && response.data.token) {
      authToken = response.data.token;
      console.log('로그인 성공, 토큰 획득:', authToken);
      
      // 선택적: 로그인 후 사용자 프로필 확인
      console.log('\n사용자 프로필 확인 중...');
      const profileResponse = await axios.get(
        `${API_BASE_URL}/user/me/profile`,
        {
          headers: { Authorization: `Bearer ${authToken}` }
        }
      );
      console.log('프로필 정보:');
      console.log(JSON.stringify(profileResponse.data, null, 2));
      
      return true;
    } else {
      console.error('로그인 실패:', response.data);
      return false;
    }
  } catch (error) {
    console.error('로그인 오류:');
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
};

// 테스트 실행
const runTest = async () => {
  console.log('===== 새 계정 로그인 테스트 =====');
  
  // 로그인
  const loginSuccess = await login();
  
  if (loginSuccess) {
    console.log('\n✅ 새 계정 로그인 테스트 성공!');
  } else {
    console.error('\n❌ 새 계정 로그인 테스트 실패.');
  }
  
  console.log('\n===== 테스트 완료 =====');
};

// 테스트 실행
runTest().catch(error => {
  console.error('테스트 실행 중 오류 발생:', error);
}); 