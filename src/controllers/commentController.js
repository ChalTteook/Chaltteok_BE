import express from 'express';
import CommentService from '../services/commentService.js';
import { verifyToken } from '../utils/authMiddleware.js';

const router = express.Router();

/**
 * 댓글 목록 조회 API
 * GET /api/v1/reviews/:reviewId/comments
 */
router.get('/:reviewId/comments', async (req, res) => {
  try {
    const reviewId = parseInt(req.params.reviewId);
    
    if (isNaN(reviewId)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 리뷰 ID입니다.'
      });
    }
    
    const comments = await CommentService.getCommentsByReviewId(reviewId);
    
    return res.status(200).json({
      success: true,
      data: {
        comments: comments
      }
    });
  } catch (error) {
    console.error('댓글 목록 조회 중 오류 발생:', error);
    return res.status(500).json({
      success: false,
      message: '댓글 목록을 불러오는 중 오류가 발생했습니다.'
    });
  }
});

/**
 * 댓글 작성 API
 * POST /api/v1/reviews/:reviewId/comments
 * 인증 필요
 */
router.post('/:reviewId/comments', verifyToken, async (req, res) => {
  try {
    const reviewId = parseInt(req.params.reviewId);
    const { content } = req.body;
    const userId = req.user.id;
    
    if (isNaN(reviewId)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 리뷰 ID입니다.'
      });
    }
    
    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: '댓글 내용을 입력해주세요.'
      });
    }
    
    const comment = await CommentService.createComment(reviewId, userId, content);
    
    return res.status(201).json({
      success: true,
      data: {
        comment: comment
      }
    });
  } catch (error) {
    console.error('댓글 작성 중 오류 발생:', error);
    return res.status(500).json({
      success: false,
      message: '댓글 작성 중 오류가 발생했습니다.'
    });
  }
});

/**
 * 댓글 수정 API
 * PUT /api/v1/comments/:commentId
 * 인증 필요
 */
router.put('/:commentId', verifyToken, async (req, res) => {
  try {
    const commentId = parseInt(req.params.commentId);
    const { content } = req.body;
    const userId = req.user.id;
    
    if (isNaN(commentId)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 댓글 ID입니다.'
      });
    }
    
    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: '댓글 내용을 입력해주세요.'
      });
    }
    
    try {
      const success = await CommentService.updateComment(commentId, userId, content);
      
      if (success) {
        return res.status(200).json({
          success: true,
          message: '댓글이 성공적으로 수정되었습니다.'
        });
      } else {
        return res.status(500).json({
          success: false,
          message: '댓글 수정에 실패했습니다.'
        });
      }
    } catch (error) {
      if (error.message === '댓글 수정 권한이 없습니다') {
        return res.status(403).json({
          success: false,
          message: '댓글 수정 권한이 없습니다.'
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('댓글 수정 중 오류 발생:', error);
    return res.status(500).json({
      success: false,
      message: '댓글 수정 중 오류가 발생했습니다.'
    });
  }
});

/**
 * 댓글 삭제 API
 * DELETE /api/v1/comments/:commentId
 * 인증 필요
 */
router.delete('/:commentId', verifyToken, async (req, res) => {
  try {
    const commentId = parseInt(req.params.commentId);
    const userId = req.user.id;
    
    if (isNaN(commentId)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 댓글 ID입니다.'
      });
    }
    
    try {
      const success = await CommentService.deleteComment(commentId, userId);
      
      if (success) {
        return res.status(200).json({
          success: true,
          message: '댓글이 성공적으로 삭제되었습니다.'
        });
      } else {
        return res.status(500).json({
          success: false,
          message: '댓글 삭제에 실패했습니다.'
        });
      }
    } catch (error) {
      if (error.message === '댓글 삭제 권한이 없습니다') {
        return res.status(403).json({
          success: false,
          message: '댓글 삭제 권한이 없습니다.'
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('댓글 삭제 중 오류 발생:', error);
    return res.status(500).json({
      success: false,
      message: '댓글 삭제 중 오류가 발생했습니다.'
    });
  }
});

export default router; 