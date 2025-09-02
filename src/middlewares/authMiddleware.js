import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { logError, logInfo } from '../utils/logger.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET_KEY || 'your-secret-key';

/**
 * JWT 토큰 인증 미들웨어
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: '인증 토큰이 필요합니다.'
    });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      logError('토큰 검증 실패', { error: err.message });
      return res.status(403).json({
        success: false,
        message: '유효하지 않은 토큰입니다.'
      });
    }
    
    req.user = user;
    logInfo('인증 성공', { userId: user.userId });
    next();
  });
};

/**
 * 관리자 권한 확인 미들웨어
 */
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: '인증되지 않은 사용자입니다.'
    });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: '관리자 권한이 필요합니다.'
    });
  }
  
  next();
};

export default {
  authenticateToken,
  isAdmin
}; 