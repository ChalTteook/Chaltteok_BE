// logging-test.js
import { 
  logInfo, 
  logError, 
  logDebug, 
  logWarn, 
  logHttp, 
  logSilly 
} from '../src/utils/logger.js';

console.log('===== 로깅 시스템 테스트 시작 =====');

// 각 로그 레벨 테스트
logDebug('디버그 로그 테스트', { testId: 1, detail: 'debug level test' });
logInfo('정보 로그 테스트', { testId: 2, userId: 1001 });
logWarn('경고 로그 테스트', { testId: 3, resource: 'database' });
logError('에러 로그 테스트', new Error('테스트 에러 발생'));
logHttp('HTTP 로그 테스트', { 
  method: 'GET',
  path: '/api/test',
  statusCode: 200
});
logSilly('상세 로그 테스트', { 
  testId: 5, 
  details: { 
    deep: { 
      nested: 'object' 
    } 
  }
});

// 객체 로깅 테스트
const complexObject = {
  user: {
    id: 1234,
    name: '홍길동',
    roles: ['user', 'admin']
  },
  actions: [
    { type: 'login', timestamp: new Date().toISOString() },
    { type: 'view', item: 'dashboard', timestamp: new Date().toISOString() }
  ],
  stats: {
    visits: 10,
    lastVisit: new Date()
  }
};

logInfo('복잡한 객체 로깅 테스트', complexObject);

// 에러 객체 로깅 테스트
try {
  throw new Error('의도적으로 발생시킨 에러');
} catch (error) {
  error.code = 'TEST_ERROR_CODE';
  error.context = { userId: 999, action: 'test' };
  logError('에러 추적 테스트', error);
}

// 비동기 작업에서의 로깅 테스트
async function asyncTest() {
  logInfo('비동기 작업 시작');
  
  try {
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        logDebug('비동기 작업 진행 중');
        // 50% 확률로 에러 발생
        if (Math.random() > 0.5) {
          reject(new Error('비동기 작업 실패'));
        } else {
          resolve();
        }
      }, 100);
    });
    
    logInfo('비동기 작업 완료');
  } catch (error) {
    logError('비동기 작업 중 에러 발생', error);
  }
}

await asyncTest();

console.log('===== 로깅 시스템 테스트 완료 ====='); 