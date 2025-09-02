import { describe, it, expect, beforeAll } from 'vitest';
import axios from 'axios';
let userToken = '';

// jest.setTimeout(20000); 제거

// 로그인 테스트 함수
async function loginAndGetToken() {
  const loginData = { email: 'test@newaccount.com', password: 'newpass1234' };
  const response = await axios.post('http://localhost:9801/api/v1/auth/login', loginData);
  if (response.data.success && response.data.token) {
    return response.data.token;
  }
  throw new Error('로그인 실패');
}

describe('리뷰 API 단위 테스트', () => {
  beforeAll(async () => {
    userToken = await loginAndGetToken();
  });

  it('GET /shops/:shopId/reviews - 리뷰 목록 조회 성공', async () => {
    const res = await axios.get('http://localhost:9801/api/v1/shops/1/reviews');
    expect(res.data.success).toBe(true);
  });

  it('POST /shops/:shopId/reviews - 인증 후 리뷰 작성 성공', async () => {
    const res = await axios.post(
      'http://localhost:9801/api/v1/shops/1/reviews',
      { description: '단위 테스트 리뷰' },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    expect(res.data.success).toBe(true);
  });
}); 