import axios from 'axios';
import { describe, it, expect } from 'vitest';

describe('로그인 API 단위 테스트', () => {
  it('POST /auth/login - 정상 로그인 시 JWT 토큰 반환', async () => {
    const loginData = { email: 'test@newaccount.com', password: 'newpass1234' };
    const res = await axios.post('http://localhost:9801/api/v1/auth/login', loginData);
    expect(res.data.success).toBe(true);
    expect(res.data.token).toBeDefined();
    // JWT 구조 검증
    const parts = res.data.token.split('.');
    expect(parts.length).toBe(3);
  });

  it('POST /auth/login - 잘못된 비밀번호로 로그인 시 실패', async () => {
    const loginData = { email: 'test@newaccount.com', password: 'wrongpassword' };
    try {
      await axios.post('http://localhost:9801/api/v1/auth/login', loginData);
    } catch (err) {
      expect(err.response.data.success).toBe(false);
    }
  });
}); 