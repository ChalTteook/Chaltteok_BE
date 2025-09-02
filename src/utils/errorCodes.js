// 에러 코드 및 메시지 중앙 관리
export const ERROR_CODES = {
  USER_NOT_FOUND: {
    code: 'USER_NOT_FOUND',
    message: '사용자를 찾을 수 없습니다.'
  },
  INVALID_PARAM: {
    code: 'INVALID_PARAM',
    message: '요청 파라미터가 잘못되었습니다.'
  },
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    message: '인증이 필요합니다. 로그인 후 이용해주세요.'
  },
  FORBIDDEN: {
    code: 'FORBIDDEN',
    message: '권한이 없습니다.'
  },
  REVIEW_NOT_FOUND: {
    code: 'REVIEW_NOT_FOUND',
    message: '리뷰를 찾을 수 없습니다.'
  },
  SHOP_NOT_FOUND: {
    code: 'SHOP_NOT_FOUND',
    message: '매장을 찾을 수 없습니다.'
  },
  DUPLICATE_EMAIL: {
    code: 'DUPLICATE_EMAIL',
    message: '이미 가입된 이메일입니다.'
  },
  INVALID_PASSWORD: {
    code: 'INVALID_PASSWORD',
    message: '비밀번호가 올바르지 않습니다.'
  },
  INTERNAL_ERROR: {
    code: 'INTERNAL_ERROR',
    message: '서버 오류가 발생했습니다.'
  },
  FILE_TOO_LARGE: {
    code: 'FILE_TOO_LARGE',
    message: '파일 크기가 제한을 초과했습니다.'
  },
  INVALID_FILE_TYPE: {
    code: 'INVALID_FILE_TYPE',
    message: '지원하지 않는 파일 형식입니다.'
  },
  // 필요에 따라 추가
}; 