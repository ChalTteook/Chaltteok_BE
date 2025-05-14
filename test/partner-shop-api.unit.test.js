import { describe, it, expect, beforeAll } from 'vitest';
import axios from 'axios';

let userToken = '';

// 로그인 테스트 함수
async function loginAndGetToken() {
  const loginData = { email: 'test@newaccount.com', password: 'newpass1234' };
  const response = await axios.post('http://localhost:9801/api/v1/auth/login', loginData);
  if (response.data.success && response.data.token) {
    return response.data.token;
  }
  throw new Error('로그인 실패');
}

describe('제휴매장 API 단위 테스트', () => {
  beforeAll(async () => {
    userToken = await loginAndGetToken();
  });

  it('GET /shops - 제휴매장 목록 조회 성공', async () => {
    const res = await axios.get('http://localhost:9801/api/v1/shops');
    expect(res.data.success).toBe(true);
  });

  // 인증이 필요한 경우 예시
  // it('POST /shops - 인증 후 제휴매장 등록 성공', async () => {
  //   const res = await axios.post(
  //     'http://localhost:9801/api/v1/shops',
  //     { name: '테스트 제휴매장' },
  //     { headers: { Authorization: `Bearer ${userToken}` } }
  //   );
  //   expect(res.data.success).toBe(true);
  // });
}); 