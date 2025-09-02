import { describe, it, expect, beforeAll } from 'vitest';
import axios from 'axios';

let userToken = '';
let createdReviewId;

beforeAll(async () => {
  // 로그인 후 토큰 획득
  const loginData = { email: 'test@newaccount.com', password: 'newpass1234' };
  const response = await axios.post('http://localhost:9801/api/v1/auth/login', loginData);
  userToken = response.data.token;

  // 리뷰 미리 생성
  const res = await axios.post(
    'http://localhost:9801/api/v1/shops/1/reviews',
    { description: '댓글 테스트용 리뷰' },
    { headers: { Authorization: `Bearer ${userToken}` } }
  );
  createdReviewId = res.data.data.id;
});

describe('리뷰 단일 조회 API 단위 테스트', () => {
  it('GET /reviews/:reviewId - 리뷰 단일 조회 성공', async () => {
    const res = await axios.get(`http://localhost:9801/api/v1/reviews/${createdReviewId}`);
    expect(res.data.success).toBe(true);
    expect(res.data.data).toBeDefined();
    expect(res.data.data.id).toBe(createdReviewId);
  });
}); 