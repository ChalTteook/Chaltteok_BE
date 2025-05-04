import multer from 'multer';
import { logError, logWarn } from './logger.js';
import { ERROR_CODES } from './errorCodes.js';

/**
 * Multer 오류 처리 미들웨어
 * 파일 업로드 관련 오류를 적절한 HTTP 상태 코드와 오류 메시지로 변환
 */
export const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // Multer 관련 오류 처리
        let message = '';
        
        switch (err.code) {
            case 'LIMIT_FILE_SIZE':
                message = '파일 크기가 제한을 초과했습니다.';
                break;
            case 'LIMIT_UNEXPECTED_FILE':
                message = '예상치 못한 필드명으로 파일이 업로드되었습니다.';
                break;
            case 'LIMIT_PART_COUNT':
                message = '업로드된 파트 수가 제한을 초과했습니다.';
                break;
            case 'LIMIT_FILE_COUNT':
                message = '업로드된 파일 수가 제한을 초과했습니다.';
                break;
            default:
                message = `파일 업로드 오류: ${err.message}`;
                break;
        }
        
        // 요청 정보
        const requestInfo = {
            url: req.originalUrl,
            method: req.method,
            requestId: req.requestId,
            body: req.body
        };
        
        // 경고 로그로 기록 (클라이언트 측 오류이므로 error가 아닌 warn)
        logWarn(`Multer 오류: ${message}`, {
            error: err,
            request: requestInfo,
            code: err.code
        });
        
        return res.status(400).json({
            success: false,
            errorCode: ERROR_CODES.FILE_TOO_LARGE.code,
            message: message
        });
    }

    // 파일 필터링에서 발생한 오류 (허용되지 않는 파일 형식 등)
    if (err.message && (
        err.message.includes('지원하지 않는 파일 형식') ||
        err.message.includes('허용된 형식')
    )) {
        logWarn(`파일 필터링 오류: ${err.message}`, {
            url: req.originalUrl,
            method: req.method,
            requestId: req.requestId
        });
        
        return res.status(400).json({
            success: false,
            errorCode: ERROR_CODES.INVALID_FILE_TYPE.code,
            message: err.message
        });
    }

    // 그 외의 오류는 다음 오류 처리 미들웨어로 전달
    next(err);
};

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