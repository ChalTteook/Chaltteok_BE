import axios from 'axios';

async function testResetPassword() {
  try {
    console.log('비밀번호 초기화 이메일 발송 테스트 중...');
    
    const resetData = {
      email: 'test2@b.com'
    };
    
    const response = await axios.post(
      'http://localhost:9801/api/v1/common/send/email',
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
    console.error('비밀번호 초기화 이메일 발송 오류:');
    if (error.response) {
      console.error('응답 상태:', error.response.status);
      console.error('응답 데이터:', error.response.data);
    } else if (error.request) {
      console.error('서버로부터 응답이 없습니다.');
    } else {
      console.error('오류 메시지:', error.message);
    }
    return false;
  }
}

testResetPassword(); 