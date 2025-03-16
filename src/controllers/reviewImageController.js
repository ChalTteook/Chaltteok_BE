import express from 'express';
import multer from 'multer';
import ReviewImageService from '../services/reviewImageService.js';
import { verifyToken } from '../utils/authMiddleware.js';

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
 * 리뷰 이미지 업로드 API
 * POST /api/v1/reviews/:reviewId/images?index=1
 * 인증 필요
 */
router.post('/:reviewId/images', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const reviewId = parseInt(req.params.reviewId);
    const imageIndex = parseInt(req.query.index || '1');
    const userId = req.user.id;
    
    // 유효성 검사
    if (isNaN(reviewId)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 리뷰 ID입니다.'
      });
    }
    
    if (isNaN(imageIndex) || imageIndex < 1 || imageIndex > 5) {
      return res.status(400).json({
        success: false,
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
          message: error.message
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('이미지 업로드 중 오류 발생:', error);
    return res.status(500).json({
      success: false,
      message: '이미지 업로드 중 오류가 발생했습니다.'
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
    const userId = req.user.id;
    
    // 유효성 검사
    if (isNaN(reviewId)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 리뷰 ID입니다.'
      });
    }
    
    if (isNaN(imageIndex) || imageIndex < 1 || imageIndex > 5) {
      return res.status(400).json({
        success: false,
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
          message: error.message
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('이미지 삭제 중 오류 발생:', error);
    return res.status(500).json({
      success: false,
      message: '이미지 삭제 중 오류가 발생했습니다.'
    });
  }
});

export default router; 