import express from 'express';
import multer from 'multer';
import ReviewService from '../services/reviewService.js';
import ReviewImageService from '../services/reviewImageService.js';
import { verifyToken } from '../utils/authMiddleware.js';
import { ERROR_CODES } from '../utils/errorCodes.js';

const router = express.Router();

// 메모리 스토리지 설정 (파일을 메모리에 임시 저장)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1 // 한 번에 하나의 파일만 업로드 가능
  }
});

/**
 * 매장 리뷰 목록 조회 API
 * GET /api/v1/reviews/shops/:shopId
 */
router.get('/shops/:shopId', async (req, res) => {
  try {
    const shopId = parseInt(req.params.shopId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    console.log(`GET /api/v1/reviews/shops/${shopId} - 파라미터:`, { shopId, page, limit });
    
    if (isNaN(shopId)) {
      return res.status(400).json({
        success: false,
        errorCode: ERROR_CODES.INVALID_PARAM.code,
        message: '유효하지 않은 매장 ID입니다.'
      });
    }
    
    try {
      const reviews = await ReviewService.getReviewsByShopId(shopId, page, limit);
      console.log(`GET /api/v1/reviews/shops/${shopId} - 성공:`, { count: reviews.length });
      
      return res.status(200).json({
        success: true,
        data: reviews
      });
    } catch (error) {
      console.error('리뷰 서비스 호출 중 오류 발생:', error);
      throw error;
    }
  } catch (error) {
    console.error('리뷰 목록 조회 중 오류 발생:', error);
    return res.status(500).json({
      success: false,
      errorCode: ERROR_CODES.INTERNAL_ERROR.code,
      message: ERROR_CODES.INTERNAL_ERROR.message
    });
  }
});

/**
 * 리뷰 상세 조회 API
 * GET /api/v1/reviews/:reviewId
 */
router.get('/:reviewId', async (req, res) => {
  try {
    const reviewId = parseInt(req.params.reviewId);
    
    if (isNaN(reviewId)) {
      return res.status(400).json({
        success: false,
        errorCode: ERROR_CODES.INVALID_PARAM.code,
        message: '유효하지 않은 리뷰 ID입니다.'
      });
    }
    
    const review = await ReviewService.getReviewById(reviewId);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        errorCode: ERROR_CODES.REVIEW_NOT_FOUND.code,
        message: ERROR_CODES.REVIEW_NOT_FOUND.message
      });
    }
    
    return res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('리뷰 조회 중 오류 발생:', error);
    return res.status(500).json({
      success: false,
      errorCode: ERROR_CODES.INTERNAL_ERROR.code,
      message: ERROR_CODES.INTERNAL_ERROR.message
    });
  }
});

/**
 * 리뷰 작성 API
 * POST /api/v1/reviews/shops/:shopId
 * 인증 필요
 */
router.post('/shops/:shopId', verifyToken, async (req, res) => {
  try {
    const shopId = parseInt(req.params.shopId);
    
    // 디버깅: JWT에서 추출한 사용자 정보 확인
    console.log('JWT 토큰에서 추출한 사용자 정보:', req.user);
    
    // userId 추출 및 유효성 검사
    if (!req.user || !req.user.userId) {
      return res.status(400).json({
        success: false,
        message: '유효한 사용자 정보가 없습니다. 다시 로그인해주세요.'
      });
    }
    
    const userId = req.user.userId; // JWT 토큰에서는 userId 필드 사용
    const { description, shopPrdId } = req.body;
    
    console.log('컨트롤러에서 추출한 userId:', userId);
    
    if (isNaN(shopId)) {
      return res.status(400).json({
        success: false,
        errorCode: ERROR_CODES.INVALID_PARAM.code,
        message: '유효하지 않은 매장 ID입니다.'
      });
    }
    
    if (!description || description.trim() === '') {
      return res.status(400).json({
        success: false,
        errorCode: ERROR_CODES.INVALID_PARAM.code,
        message: '리뷰 내용을 입력해주세요.'
      });
    }
    
    const review = await ReviewService.createReview(shopId, shopPrdId || null, userId, description);
    
    return res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('리뷰 작성 중 오류 발생:', error);
    return res.status(500).json({
      success: false,
      errorCode: ERROR_CODES.INTERNAL_ERROR.code,
      message: ERROR_CODES.INTERNAL_ERROR.message
    });
  }
});

/**
 * 리뷰 수정 API
 * PUT /api/v1/shops/:shopId/reviews/:reviewId
 * 인증 필요
 */
router.put('/shops/:shopId/reviews/:reviewId', verifyToken, async (req, res) => {
  try {
    const shopId = parseInt(req.params.shopId);
    const reviewId = parseInt(req.params.reviewId);
    
    // userId 추출 및 유효성 검사
    if (!req.user || !req.user.userId) {
      return res.status(400).json({
        success: false,
        message: '유효한 사용자 정보가 없습니다. 다시 로그인해주세요.'
      });
    }
    
    const userId = req.user.userId; // JWT 토큰에서는 userId 필드 사용
    const { description } = req.body;
    
    console.log('수정 컨트롤러에서 추출한 userId:', userId);
    
    if (isNaN(shopId)) {
      return res.status(400).json({
        success: false,
        errorCode: ERROR_CODES.INVALID_PARAM.code,
        message: '유효하지 않은 매장 ID입니다.'
      });
    }
    
    if (isNaN(reviewId)) {
      return res.status(400).json({
        success: false,
        errorCode: ERROR_CODES.INVALID_PARAM.code,
        message: '유효하지 않은 리뷰 ID입니다.'
      });
    }
    
    if (!description || description.trim() === '') {
      return res.status(400).json({
        success: false,
        errorCode: ERROR_CODES.INVALID_PARAM.code,
        message: '리뷰 내용을 입력해주세요.'
      });
    }
    
    try {
      // 리뷰가 해당 매장의 것인지 먼저 확인
      const review = await ReviewService.getReviewById(reviewId);
      if (!review || review.shopId !== shopId) {
        return res.status(404).json({
          success: false,
          errorCode: ERROR_CODES.REVIEW_NOT_FOUND.code,
          message: ERROR_CODES.REVIEW_NOT_FOUND.message
        });
      }
      
      const updatedReview = await ReviewService.updateReview(reviewId, userId, description);
      
      return res.status(200).json({
        success: true,
        data: updatedReview
      });
    } catch (error) {
      if (error.message.includes('권한이 없습니다')) {
        return res.status(403).json({
          success: false,
          errorCode: ERROR_CODES.FORBIDDEN.code,
          message: ERROR_CODES.FORBIDDEN.message
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('리뷰 수정 중 오류 발생:', error);
    return res.status(500).json({
      success: false,
      errorCode: ERROR_CODES.INTERNAL_ERROR.code,
      message: ERROR_CODES.INTERNAL_ERROR.message
    });
  }
});

/**
 * 리뷰 삭제 API
 * DELETE /api/v1/shops/:shopId/reviews/:reviewId
 * 인증 필요
 */
router.delete('/shops/:shopId/reviews/:reviewId', verifyToken, async (req, res) => {
  try {
    const shopId = parseInt(req.params.shopId);
    const reviewId = parseInt(req.params.reviewId);
    
    // userId 추출 및 유효성 검사
    if (!req.user || !req.user.userId) {
      return res.status(400).json({
        success: false,
        message: '유효한 사용자 정보가 없습니다. 다시 로그인해주세요.'
      });
    }
    
    const userId = req.user.userId; // JWT 토큰에서는 userId 필드 사용
    
    console.log('삭제 컨트롤러에서 추출한 userId:', userId);
    
    if (isNaN(shopId)) {
      return res.status(400).json({
        success: false,
        errorCode: ERROR_CODES.INVALID_PARAM.code,
        message: '유효하지 않은 매장 ID입니다.'
      });
    }
    
    if (isNaN(reviewId)) {
      return res.status(400).json({
        success: false,
        errorCode: ERROR_CODES.INVALID_PARAM.code,
        message: '유효하지 않은 리뷰 ID입니다.'
      });
    }
    
    try {
      // 리뷰가 해당 매장의 것인지 먼저 확인
      const review = await ReviewService.getReviewById(reviewId);
      if (!review || review.shopId !== shopId) {
        return res.status(404).json({
          success: false,
          errorCode: ERROR_CODES.REVIEW_NOT_FOUND.code,
          message: ERROR_CODES.REVIEW_NOT_FOUND.message
        });
      }
      
      const success = await ReviewService.deleteReview(reviewId, userId);
      
      if (success) {
        return res.status(200).json({
          success: true,
          message: '리뷰가 성공적으로 삭제되었습니다.'
        });
      } else {
        return res.status(404).json({
          success: false,
          message: '삭제할 리뷰를 찾을 수 없습니다.'
        });
      }
    } catch (error) {
      if (error.message.includes('권한이 없습니다')) {
        return res.status(403).json({
          success: false,
          errorCode: ERROR_CODES.FORBIDDEN.code,
          message: ERROR_CODES.FORBIDDEN.message
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('리뷰 삭제 중 오류 발생:', error);
    return res.status(500).json({
      success: false,
      errorCode: ERROR_CODES.INTERNAL_ERROR.code,
      message: ERROR_CODES.INTERNAL_ERROR.message
    });
  }
});

/**
 * 리뷰 이미지 업로드 API
 * POST /api/v1/reviews/:reviewId/images?index=1
 * 인증 필요
 */
router.post('/:reviewId/images', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const reviewId = parseInt(req.params.reviewId);
    const imageIndex = parseInt(req.query.index || '1');
    
    // userId 추출 및 유효성 검사
    if (!req.user || !req.user.userId) {
      return res.status(400).json({
        success: false,
        message: '유효한 사용자 정보가 없습니다. 다시 로그인해주세요.'
      });
    }
    
    const userId = req.user.userId; // JWT 토큰에서는 userId 필드 사용
    
    console.log('이미지 업로드 컨트롤러에서 추출한 userId:', userId);
    
    // 유효성 검사
    if (isNaN(reviewId)) {
      return res.status(400).json({
        success: false,
        errorCode: ERROR_CODES.INVALID_PARAM.code,
        message: '유효하지 않은 리뷰 ID입니다.'
      });
    }
    
    if (isNaN(imageIndex) || imageIndex < 1 || imageIndex > 5) {
      return res.status(400).json({
        success: false,
        errorCode: ERROR_CODES.INVALID_PARAM.code,
        message: '유효하지 않은 이미지 인덱스입니다. 1~5 사이의 값을 입력해주세요.'
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '업로드할 이미지 파일이 없습니다.'
      });
    }
    
    // 이미지 업로드 서비스 호출
    try {
      const imageUrl = await ReviewImageService.uploadImage(reviewId, userId, req.file, imageIndex);
      
      return res.status(200).json({
        success: true,
        data: {
          imageUrl: imageUrl
        }
      });
    } catch (error) {
      if (error.message.includes('권한이 없습니다')) {
        return res.status(403).json({
          success: false,
          errorCode: ERROR_CODES.FORBIDDEN.code,
          message: error.message
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('이미지 업로드 중 오류 발생:', error);
    return res.status(500).json({
      success: false,
      errorCode: ERROR_CODES.INTERNAL_ERROR.code,
      message: ERROR_CODES.INTERNAL_ERROR.message
    });
  }
});

/**
 * 리뷰 이미지 삭제 API
 * DELETE /api/v1/reviews/:reviewId/images/:imageIndex
 * 인증 필요
 */
router.delete('/:reviewId/images/:imageIndex', verifyToken, async (req, res) => {
  try {
    const reviewId = parseInt(req.params.reviewId);
    const imageIndex = parseInt(req.params.imageIndex);
    
    // userId 추출 및 유효성 검사
    if (!req.user || !req.user.userId) {
      return res.status(400).json({
        success: false,
        message: '유효한 사용자 정보가 없습니다. 다시 로그인해주세요.'
      });
    }
    
    const userId = req.user.userId; // JWT 토큰에서는 userId 필드 사용
    
    console.log('이미지 삭제 컨트롤러에서 추출한 userId:', userId);
    
    // 유효성 검사
    if (isNaN(reviewId)) {
      return res.status(400).json({
        success: false,
        errorCode: ERROR_CODES.INVALID_PARAM.code,
        message: '유효하지 않은 리뷰 ID입니다.'
      });
    }
    
    if (isNaN(imageIndex) || imageIndex < 1 || imageIndex > 5) {
      return res.status(400).json({
        success: false,
        errorCode: ERROR_CODES.INVALID_PARAM.code,
        message: '유효하지 않은 이미지 인덱스입니다. 1~5 사이의 값을 입력해주세요.'
      });
    }
    
    // 이미지 삭제 서비스 호출
    try {
      const success = await ReviewImageService.deleteImage(reviewId, userId, imageIndex);
      
      if (success) {
        return res.status(200).json({
          success: true,
          message: '이미지가 성공적으로 삭제되었습니다.'
        });
      } else {
        return res.status(404).json({
          success: false,
          message: '삭제할 이미지가 없습니다.'
        });
      }
    } catch (error) {
      if (error.message.includes('권한이 없습니다')) {
        return res.status(403).json({
          success: false,
          errorCode: ERROR_CODES.FORBIDDEN.code,
          message: error.message
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('이미지 삭제 중 오류 발생:', error);
    return res.status(500).json({
      success: false,
      errorCode: ERROR_CODES.INTERNAL_ERROR.code,
      message: ERROR_CODES.INTERNAL_ERROR.message
    });
  }
});

/**
 * 리뷰 좋아요 추가 API
 * POST /api/v1/shops/:shopId/reviews/:reviewId/like
 * 인증 필요
 */
router.post('/shops/:shopId/reviews/:reviewId/like', verifyToken, async (req, res) => {
  try {
    const shopId = parseInt(req.params.shopId);
    const reviewId = parseInt(req.params.reviewId);
    
    // userId 추출 및 유효성 검사
    if (!req.user || !req.user.userId) {
      return res.status(400).json({
        success: false,
        message: '유효한 사용자 정보가 없습니다. 다시 로그인해주세요.'
      });
    }
    
    const userId = req.user.userId; // JWT 토큰에서는 userId 필드 사용
    
    console.log('좋아요 API 컨트롤러에서 추출한 userId:', userId);
    
    if (isNaN(shopId)) {
      return res.status(400).json({
        success: false,
        errorCode: ERROR_CODES.INVALID_PARAM.code,
        message: '유효하지 않은 매장 ID입니다.'
      });
    }
    
    if (isNaN(reviewId)) {
      return res.status(400).json({
        success: false,
        errorCode: ERROR_CODES.INVALID_PARAM.code,
        message: '유효하지 않은 리뷰 ID입니다.'
      });
    }
    
    // 리뷰가 해당 매장의 것인지 먼저 확인
    const review = await ReviewService.getReviewById(reviewId);
    if (!review || review.shopId !== shopId) {
      return res.status(404).json({
        success: false,
        errorCode: ERROR_CODES.REVIEW_NOT_FOUND.code,
        message: ERROR_CODES.REVIEW_NOT_FOUND.message
      });
    }
    
    // 좋아요 기능에 userId를 포함하도록 서비스 로직 수정
    const success = await ReviewService.incrementLike(reviewId, userId);
    
    if (success) {
      return res.status(200).json({
        success: true,
        message: '좋아요가 성공적으로 추가되었습니다.'
      });
    } else {
      return res.status(404).json({
        success: false,
        message: '해당 리뷰를 찾을 수 없습니다.'
      });
    }
  } catch (error) {
    console.error('좋아요 추가 중 오류 발생:', error);
    return res.status(500).json({
      success: false,
      errorCode: ERROR_CODES.INTERNAL_ERROR.code,
      message: ERROR_CODES.INTERNAL_ERROR.message
    });
  }
});

export default router; 