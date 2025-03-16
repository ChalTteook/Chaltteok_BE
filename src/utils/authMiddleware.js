import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// 환경 변수 로드
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key_do_not_use_in_production';

/**
 * JWT 토큰 검증 미들웨어
 * 요청 헤더의 Authorization 토큰을 검증하고 사용자 정보를 req.user에 추가
 */
export const verifyToken = (req, res, next) => {
  try {
    // 헤더에서 토큰 추출
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다. 로그인 후 이용해주세요.'
      });
    }
    
    // Bearer 접두사 제거 후 토큰 추출
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '유효하지 않은 인증 토큰입니다.'
      });
    }
    
    // 토큰 검증
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 검증된 사용자 정보를 요청 객체에 추가
    req.user = decoded;
    
    // 다음 미들웨어 또는 라우트 핸들러로 이동
    next();
  } catch (error) {
    console.error('토큰 검증 중 오류 발생:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '인증 토큰이 만료되었습니다. 다시 로그인해주세요.'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: '유효하지 않은 인증 토큰입니다.'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: '인증 처리 중 오류가 발생했습니다.'
    });
  }
};

/**
 * 선택적 인증 미들웨어
 * 토큰이 있으면 검증하고 사용자 정보를 req.user에 추가하지만, 없어도 다음 단계로 진행
 */
export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // 토큰이 없으면 인증되지 않은 사용자로 처리하고 다음 단계로 진행
      req.user = null;
      return next();
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      req.user = null;
      return next();
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    // 토큰 검증 실패 시 인증되지 않은 사용자로 처리하고 다음 단계로 진행
    console.error('선택적 인증 중 오류 발생:', error);
    req.user = null;
    next();
  }
}; 