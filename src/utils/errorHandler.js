import { logError, logWarn } from './logger.js';
import { ERROR_CODES } from './errorCodes.js';

/**
 * 일반적인 오류 처리 미들웨어
 * API 응답의 일관성을 유지하기 위한 기본 오류 핸들러
 */
export const handleGenericError = (err, req, res, next) => {
    // 요청 정보
    const requestInfo = {
        url: req.originalUrl,
        method: req.method,
        requestId: req.requestId,
        params: req.params,
        query: req.query
    };
    
    // 오류 로그 기록
    logError('서버 오류 발생', {
        error: err,
        request: requestInfo
    });
    
    // 개발 환경에서는 오류 스택을 포함하여 응답
    const errorDetails = process.env.NODE_ENV === 'development' 
        ? { stack: err.stack }
        : {};
    
    res.status(500).json({
        success: false,
        errorCode: ERROR_CODES.INTERNAL_ERROR.code,
        message: ERROR_CODES.INTERNAL_ERROR.message,
        ...errorDetails
    });
}; 