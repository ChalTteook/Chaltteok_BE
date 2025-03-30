/**
 * 관리자 권한 확인 미들웨어
 * @param {Object} req - Express 요청 객체
 * @param {Object} res - Express 응답 객체
 * @param {Function} next - 다음 미들웨어 호출 함수
 */
export const isAdmin = (req, res, next) => {
    // 인증된 사용자 정보에서 role 또는 isAdmin 속성 확인
    if (!req.user || !req.user.role || req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: '관리자 권한이 필요합니다.'
        });
    }
    
    next();
}; 