import { logHttp } from '../utils/logger.js';

/**
 * HTTP 요청 로깅 미들웨어
 * 모든 HTTP 요청에 대한 정보를 로깅합니다.
 */
const httpLogger = (req, res, next) => {
  // 요청 시작 시간
  const start = Date.now();
  
  // 요청 정보 수집
  const requestInfo = {
    method: req.method,
    url: req.originalUrl || req.url,
    ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
    referrer: req.headers.referer || req.headers.referrer,
    requestId: req.headers['x-request-id'] || `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  };
  
  // 요청 본문 (중요 정보는 필터링)
  const filteredBody = { ...req.body };
  
  // 민감한 필드 필터링
  if (filteredBody.password) filteredBody.password = '******';
  if (filteredBody.passwordConfirm) filteredBody.passwordConfirm = '******';
  if (filteredBody.token) filteredBody.token = '******';
  
  requestInfo.body = filteredBody;
  
  // 로깅
  logHttp(`요청 [${requestInfo.method}] ${requestInfo.url}`, requestInfo);
  
  // 응답 완료 이벤트 리스너
  res.on('finish', () => {
    // 응답 시간 계산
    const duration = Date.now() - start;
    
    // 응답 정보 수집
    const responseInfo = {
      statusCode: res.statusCode,
      statusMessage: res.statusMessage,
      duration: `${duration}ms`,
      requestId: requestInfo.requestId
    };
    
    // 성공 또는 실패에 따라 메시지 포맷 변경
    const isSuccess = res.statusCode < 400;
    const logMessage = isSuccess 
      ? `응답 [${requestInfo.method}] ${requestInfo.url} ${res.statusCode} (${duration}ms)`
      : `실패 [${requestInfo.method}] ${requestInfo.url} ${res.statusCode} (${duration}ms)`;
    
    // 로깅
    logHttp(logMessage, responseInfo);
  });
  
  // 요청 ID를 요청 객체에 추가하여 나중에 참조할 수 있도록 함
  req.requestId = requestInfo.requestId;
  
  next();
};

export default httpLogger; 