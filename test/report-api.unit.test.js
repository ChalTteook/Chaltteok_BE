import { describe, it, expect, beforeAll } from 'vitest';
import axios from 'axios';

let userToken = '';
let adminToken = '';

// 일반 사용자 로그인
async function loginAndGetUserToken() {
  const loginData = { email: 'test@newaccount.com', password: 'newpass1234' };
  const response = await axios.post('http://localhost:9801/api/v1/auth/login', loginData);
  if (response.data.success && response.data.token) {
    return response.data.token;
  }
  throw new Error('일반 사용자 로그인 실패');
}
// 관리자 로그인
async function loginAndGetAdminToken() {
  const loginData = { email: 'admin@test.com', password: 'test1234' };
  const response = await axios.post('http://localhost:9801/api/v1/auth/login', loginData);
  if (response.data.success && response.data.token) {
    return response.data.token;
  }
  throw new Error('관리자 로그인 실패');
}

describe('신고 API 단위 테스트', () => {
  beforeAll(async () => {
    userToken = await loginAndGetUserToken();
    adminToken = await loginAndGetAdminToken();
  });

  it('POST /reports/shops/:shopId - 인증 후 샵 신고 생성 성공', async () => {
    const res = await axios.post(
      'http://localhost:9801/api/v1/reports/shops/1',
      { reportType: 'inappropriate', description: '단위 테스트 신고' },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    expect(res.data.success).toBe(true);
  });

  // 관리자 권한이 필요한 테스트 예시
  // it('PUT /admin/reports/:reportId/status - 관리자 권한으로 신고 상태 변경 성공', async () => {
  //   const res = await axios.put(
  //     'http://localhost:9801/api/v1/admin/reports/1/status',
  //     { status: 'in_review', adminComment: '테스트' },
  //     { headers: { Authorization: `Bearer ${adminToken}` } }
  //   );
  //   expect(res.data.success).toBe(true);
  // });
}); 