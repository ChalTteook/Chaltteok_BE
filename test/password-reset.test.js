import axios from 'axios';

// 테스트 환경 설정
const API_BASE_URL = 'http://localhost:9801/api/v1';
let authToken = ''; // 로그인 후 토큰을 저장할 변수
let testPhoneNumber = '01012345678';
let verificationCode = '';

// 로그인 함수
const login = async () => {
  try {
    console.log('로그인 시도 중...');
    console.log('요청 URL:', `${API_BASE_URL}/auth/login`);
    console.log('요청 데이터:', { email: 'admin@test.com', password: 'test1234' });
    
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@test.com',
      password: 'test1234'
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

// 비밀번호 변경 테스트 (로그인 후)
const testChangePassword = async () => {
  try {
    console.log('\n비밀번호 변경 테스트 중...');
    
    const changeData = {
      newPassword: 'newPassword123',
      confirmPassword: 'newPassword123'
    };
    
    const response = await axios.post(
      `${API_BASE_URL}/user/change-password`,
      changeData,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    console.log('비밀번호 변경 응답:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      console.log('비밀번호 변경 결과: 성공');
      // 변경된 비밀번호로 다시 로그인 시도
      console.log('\n변경된 비밀번호로 로그인 시도 중...');
      
      try {
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
          email: 'admin@test.com',
          password: 'newPassword123'
        });
        
        console.log('로그인 응답:');
        console.log(JSON.stringify(loginResponse.data, null, 2));
        
        if (loginResponse.data.success) {
          console.log('변경된 비밀번호로 로그인 성공!');
          
          // 원래 비밀번호로 다시 변경
          console.log('\n원래 비밀번호로 다시 변경 중...');
          
          authToken = loginResponse.data.token;
          
          const resetResponse = await axios.post(
            `${API_BASE_URL}/user/change-password`,
            {
              newPassword: 'test1234',
              confirmPassword: 'test1234'
            },
            {
              headers: { Authorization: `Bearer ${authToken}` }
            }
          );
          
          console.log('비밀번호 재설정 응답:');
          console.log(JSON.stringify(resetResponse.data, null, 2));
          
          return resetResponse.data.success;
        } else {
          console.log('변경된 비밀번호로 로그인 실패');
          return false;
        }
      } catch (loginError) {
        console.error('변경된 비밀번호로 로그인 오류:', loginError.response?.data || loginError.message);
        return false;
      }
    } else {
      console.log('비밀번호 변경 결과: 실패');
      return false;
    }
  } catch (error) {
    console.error('비밀번호 변경 오류:', error.response?.data || error.message);
    return false;
  }
};

// 휴대폰 인증 코드 발송 테스트
const testSendAuthCode = async () => {
  try {
    console.log('\n휴대폰 인증 코드 발송 테스트 중...');
    
    const phoneData = {
      phone_number: '01012345678'
    };
    
    const response = await axios.post(
      `${API_BASE_URL}/common/send/auth`,
      phoneData
    );
    
    console.log('인증 코드 발송 응답:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      console.log('인증 코드 발송 결과: 성공');
      // 인증 코드를 테스트에서 사용할 수 있도록 반환
      return response.data.message.code;
    } else {
      console.log('인증 코드 발송 결과: 실패');
      return null;
    }
  } catch (error) {
    console.error('인증 코드 발송 오류:', error.response?.data || error.message);
    return null;
  }
};

// 휴대폰 인증 코드 확인 테스트
const testVerifyAuthCode = async (authCode) => {
  try {
    console.log('\n휴대폰 인증 코드 확인 테스트 중...');
    
    if (!authCode) {
      console.error('인증 코드가 없습니다.');
      return null;
    }
    
    const verifyData = {
      phone_number: '01012345678',
      code: authCode
    };
    
    const response = await axios.post(
      `${API_BASE_URL}/common/check/auth`,
      verifyData
    );
    
    console.log('인증 코드 확인 응답:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      console.log('인증 코드 확인 결과: 성공');
      // 유저 이메일을 반환
      return response.data.message.email;
    } else {
      console.log('인증 코드 확인 결과: 실패');
      return null;
    }
  } catch (error) {
    console.error('인증 코드 확인 오류:', error.response?.data || error.message);
    return null;
  }
};

// 비밀번호 초기화 이메일 발송 테스트
const testResetPassword = async (email) => {
  try {
    console.log('\n비밀번호 초기화 이메일 발송 테스트 중...');
    
    if (!email) {
      console.error('이메일이 없습니다.');
      return false;
    }
    
    const resetData = {
      email: email
    };
    
    const response = await axios.post(
      `${API_BASE_URL}/common/send/email`,
      resetData
    );
    
    console.log('비밀번호 초기화 이메일 발송 응답:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      console.log('비밀번호 초기화 이메일 발송 결과: 성공');
      return true;
    } else {
      console.log('비밀번호 초기화 이메일 발송 결과: 실패');
      return false;
    }
  } catch (error) {
    console.error('비밀번호 초기화 이메일 발송 오류:', error.response?.data || error.message);
    return false;
  }
};

// 전체 테스트 프로세스 실행 함수
const runAllTests = async () => {
  console.log('===== 비밀번호 찾기 및 초기화 API 테스트 시작 =====');
  
  // 1. 로그인 테스트
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.error('로그인 실패. 테스트를 중단합니다.');
    return;
  }
  
  // 2. 비밀번호 변경 테스트
  console.log('\n----- 로그인 후 비밀번호 변경 테스트 -----');
  const changePasswordSuccess = await testChangePassword();
  console.log('비밀번호 변경 테스트 결과:', changePasswordSuccess ? '성공' : '실패');
  
  // 3. 휴대폰 인증 코드 발송 테스트
  console.log('\n----- 휴대폰 인증 코드 발송 테스트 -----');
  const authCode = await testSendAuthCode();
  if (!authCode) {
    console.warn('인증 코드 발송 실패 또는 반환되지 않음. 다음 테스트를 건너뜁니다.');
  } else {
    // 4. 휴대폰 인증 코드 확인 테스트
    console.log('\n----- 휴대폰 인증 코드 확인 테스트 -----');
    const userEmail = await testVerifyAuthCode(authCode);
    
    if (userEmail) {
      // 5. 비밀번호 초기화 이메일 발송 테스트
      console.log('\n----- 비밀번호 초기화 이메일 발송 테스트 -----');
      const resetPasswordSuccess = await testResetPassword(userEmail);
      console.log('비밀번호 초기화 이메일 발송 테스트 결과:', resetPasswordSuccess ? '성공' : '실패');
    }
  }
  
  console.log('\n===== 비밀번호 찾기 및 초기화 API 테스트 완료 =====');
};

// 테스트 실행
runAllTests().catch(error => {
  console.error('테스트 실행 중 오류 발생:', error);
}); 