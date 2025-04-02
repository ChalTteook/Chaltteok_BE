import request from 'supertest';
import app from '../chaltteok.js';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM 환경에서 __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 모의 함수 생성 유틸리티
const createMockFn = () => {
  const fn = (...args) => {
    fn.mock.calls.push(args);
    return fn.mock.implementation ? fn.mock.implementation(...args) : undefined;
  };
  
  fn.mock = {
    calls: [],
    implementation: null
  };
  
  fn.mockImplementation = (implementation) => {
    fn.mock.implementation = implementation;
    return fn;
  };
  
  fn.mockReset = () => {
    fn.mock.calls = [];
    return fn;
  };
  
  return fn;
};

// 모의 서비스 가져오기
// ESM 환경에서는 import 이후에 모킹할 수 없으므로, 수동으로 모킹합니다
import ReviewService from '../src/services/reviewService.js';
import ReviewImageService from '../src/services/reviewImageService.js';

// 모의 사용자 및 토큰 생성
const testUser = { 
  id: 999, 
  email: 'test@example.com',
  name: '테스트 사용자' 
};

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET || 'default_secret_key_do_not_use_in_production',
    { expiresIn: '1h' }
  );
};

// 테스트 데이터
const testShopId = 1;
let testReviewId;

describe('Review API 테스트', () => {
  // 각 테스트 전 설정
  beforeAll(() => {
    // 수동으로 모의 함수 생성
    ReviewService.getReviewsByShopId = createMockFn().mockImplementation((shopId, page, limit) => {
      return [
        {
          id: 1,
          shopId: testShopId,
          userId: testUser.id,
          description: '맛있어요!',
          likes: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: { name: testUser.name },
          images: []
        }
      ];
    });

    ReviewService.getReviewById = createMockFn().mockImplementation((reviewId) => {
      if (reviewId === 1) {
        return {
          id: 1,
          shopId: testShopId,
          userId: testUser.id,
          description: '맛있어요!',
          likes: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: { name: testUser.name },
          images: []
        };
      }
      return null;
    });

    ReviewService.createReview = createMockFn().mockImplementation((shopId, shopPrdId, userId, description) => {
      return {
        id: 1,
        shopId,
        userId,
        description,
        likes: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });

    ReviewService.updateReview = createMockFn().mockImplementation((reviewId, userId, description) => {
      if (userId !== testUser.id) {
        throw new Error('리뷰 수정 권한이 없습니다');
      }
      return {
        id: reviewId,
        shopId: testShopId,
        userId,
        description,
        likes: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });

    ReviewService.deleteReview = createMockFn().mockImplementation((reviewId, userId) => {
      if (userId !== testUser.id) {
        throw new Error('리뷰 삭제 권한이 없습니다');
      }
      return true;
    });

    ReviewService.incrementLike = createMockFn().mockImplementation((reviewId, userId) => {
      return true;
    });

    ReviewImageService.uploadImage = createMockFn().mockImplementation((reviewId, userId, file, imageIndex) => {
      if (userId !== testUser.id) {
        throw new Error('이미지 업로드 권한이 없습니다');
      }
      return `https://example.com/images/review_${reviewId}_${imageIndex}.jpg`;
    });

    ReviewImageService.deleteImage = createMockFn().mockImplementation((reviewId, userId, imageIndex) => {
      if (userId !== testUser.id) {
        throw new Error('이미지 삭제 권한이 없습니다');
      }
      return true;
    });
  });

  // 리뷰 목록 조회 테스트
  describe('GET /shops/:shopId/reviews', () => {
    it('매장의 리뷰 목록을 성공적으로 조회해야 함', async () => {
      const response = await request(app)
        .get(`/api/v1/shops/${testShopId}/reviews`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('유효하지 않은 매장 ID로 요청시 400 에러를 반환해야 함', async () => {
      const response = await request(app)
        .get('/api/v1/shops/invalid/reviews')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('유효하지 않은 매장 ID입니다.');
    });
  });

  // 리뷰 상세 조회 테스트
  describe('GET /shops/:shopId/reviews/:reviewId', () => {
    it('리뷰 상세 정보를 성공적으로 조회해야 함', async () => {
      const response = await request(app)
        .get(`/api/v1/shops/${testShopId}/reviews/1`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(1);
    });

    it('존재하지 않는 리뷰 ID로 요청시 404 에러를 반환해야 함', async () => {
      const response = await request(app)
        .get(`/api/v1/shops/${testShopId}/reviews/999`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  // 리뷰 작성 테스트
  describe('POST /shops/:shopId/reviews', () => {
    it('인증 없이 요청시 401 에러를 반환해야 함', async () => {
      const response = await request(app)
        .post(`/api/v1/shops/${testShopId}/reviews`)
        .send({ description: '맛있어요!' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('유효한 토큰으로 리뷰를 성공적으로 작성해야 함', async () => {
      const token = generateToken(testUser);
      const response = await request(app)
        .post(`/api/v1/shops/${testShopId}/reviews`)
        .set('Authorization', `Bearer ${token}`)
        .send({ description: '맛있어요!' })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.description).toBe('맛있어요!');
      testReviewId = response.body.data.id;
    });

    it('리뷰 내용이 비어있을 경우 400 에러를 반환해야 함', async () => {
      const token = generateToken(testUser);
      const response = await request(app)
        .post(`/api/v1/shops/${testShopId}/reviews`)
        .set('Authorization', `Bearer ${token}`)
        .send({ description: '' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('리뷰 내용을 입력해주세요.');
    });
  });

  // 리뷰 수정 테스트
  describe('PUT /shops/:shopId/reviews/:reviewId', () => {
    it('인증 없이 요청시 401 에러를 반환해야 함', async () => {
      const response = await request(app)
        .put(`/api/v1/shops/${testShopId}/reviews/1`)
        .send({ description: '정말 맛있어요!' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('유효한 토큰으로 리뷰를 성공적으로 수정해야 함', async () => {
      const token = generateToken(testUser);
      const response = await request(app)
        .put(`/api/v1/shops/${testShopId}/reviews/1`)
        .set('Authorization', `Bearer ${token}`)
        .send({ description: '정말 맛있어요!' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.description).toBe('정말 맛있어요!');
    });

    it('다른 사용자의 리뷰를 수정하려고 하면 403 에러를 반환해야 함', async () => {
      const otherUser = { id: 888, email: 'other@example.com' };
      const token = generateToken(otherUser);
      
      // 모의 구현을 일시적으로 오버라이드
      const originalImplementation = ReviewService.updateReview;
      ReviewService.updateReview.mockImplementation((reviewId, userId, description) => {
        throw new Error('권한이 없습니다');
      });
      
      const response = await request(app)
        .put(`/api/v1/shops/${testShopId}/reviews/1`)
        .set('Authorization', `Bearer ${token}`)
        .send({ description: '맛있지 않아요.' })
        .expect(403);

      expect(response.body.success).toBe(false);
      
      // 모의 구현 복구
      ReviewService.updateReview = originalImplementation;
    });
  });

  // 리뷰 삭제 테스트
  describe('DELETE /shops/:shopId/reviews/:reviewId', () => {
    it('인증 없이 요청시 401 에러를 반환해야 함', async () => {
      const response = await request(app)
        .delete(`/api/v1/shops/${testShopId}/reviews/1`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('유효한 토큰으로 리뷰를 성공적으로 삭제해야 함', async () => {
      const token = generateToken(testUser);
      const response = await request(app)
        .delete(`/api/v1/shops/${testShopId}/reviews/1`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('성공적으로 삭제');
    });
  });

  // 리뷰 이미지 업로드 테스트
  describe('POST /reviews/:reviewId/images', () => {
    it('인증 없이 요청시 401 에러를 반환해야 함', async () => {
      const response = await request(app)
        .post('/api/v1/reviews/1/images')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('유효한 토큰으로 이미지를 업로드해야 함', async () => {
      // 테스트용 더미 이미지 파일 생성
      const mockImagePath = path.join(__dirname, 'mock-image.jpg');
      fs.writeFileSync(mockImagePath, 'fake image content');

      const token = generateToken(testUser);
      const response = await request(app)
        .post('/api/v1/reviews/1/images?index=1')
        .set('Authorization', `Bearer ${token}`)
        .attach('image', mockImagePath)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('imageUrl');

      // 테스트 후 더미 파일 정리
      fs.unlinkSync(mockImagePath);
    });
  });

  // 리뷰 이미지 삭제 테스트
  describe('DELETE /reviews/:reviewId/images/:imageIndex', () => {
    it('인증 없이 요청시 401 에러를 반환해야 함', async () => {
      const response = await request(app)
        .delete('/api/v1/reviews/1/images/1')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('유효한 토큰으로 이미지를 삭제해야 함', async () => {
      const token = generateToken(testUser);
      const response = await request(app)
        .delete('/api/v1/reviews/1/images/1')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('성공적으로 삭제');
    });
  });

  // 리뷰 좋아요 테스트
  describe('POST /shops/:shopId/reviews/:reviewId/like', () => {
    it('인증 없이 요청시 401 에러를 반환해야 함', async () => {
      const response = await request(app)
        .post(`/api/v1/shops/${testShopId}/reviews/1/like`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('유효한 토큰으로 좋아요를 성공적으로 추가해야 함', async () => {
      const token = generateToken(testUser);
      const response = await request(app)
        .post(`/api/v1/shops/${testShopId}/reviews/1/like`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('좋아요가 성공적으로 추가');
    });
  });
}); 