import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 로그 디렉토리 생성
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 로그 레벨 정의
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
  silly: 5
};

// 개발 환경인지 확인
const isDevelopment = process.env.NODE_ENV !== 'production';

// 로그 레벨 선택 (개발 환경: debug, 프로덕션: info)
const level = isDevelopment ? 'debug' : 'info';

// 로그 색상 설정
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
  silly: 'white'
};

// winston에 색상 추가
winston.addColors(colors);

// 콘솔 출력 포맷
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} [${info.level}]: ${info.message} ${info.stack || ''}`
  )
);

// 파일 출력 포맷 (JSON)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// 로그 전처리 포맷 (객체 로깅 등을 위한 처리)
const formatMessage = winston.format((info) => {
  if (info.message && typeof info.message === 'object') {
    info.message = JSON.stringify(info.message, null, 2);
  }
  return info;
});

// 전체 로그 파일 transportor 설정
const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logDir, 'application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxFiles: '30d',
  maxSize: '20m',
  zippedArchive: true,
  level: 'silly',
  format: fileFormat
});

// 에러 로그 파일 transportor 설정
const errorFileRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxFiles: '30d',
  maxSize: '20m',
  zippedArchive: true,
  level: 'error',
  format: fileFormat
});

// 로거 생성
const logger = winston.createLogger({
  level,
  levels,
  format: winston.format.combine(
    formatMessage(),
    winston.format.timestamp(),
    winston.format.metadata({
      fillExcept: ['timestamp', 'level', 'message', 'stack']
    }),
    winston.format.errors({ stack: true })
  ),
  transports: [
    // 콘솔 출력 설정
    new winston.transports.Console({
      format: consoleFormat,
      level: isDevelopment ? 'silly' : 'http'
    }),
    fileRotateTransport,
    errorFileRotateTransport
  ],
  exceptionHandlers: [
    // 예외 처리 로그 설정
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, 'exception-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d',
      zippedArchive: true,
      format: fileFormat
    }),
    new winston.transports.Console({
      format: consoleFormat
    })
  ],
  rejectionHandlers: [
    // Promise 거부 처리 로그 설정
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, 'rejection-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d',
      zippedArchive: true,
      format: fileFormat
    }),
    new winston.transports.Console({
      format: consoleFormat
    })
  ],
  exitOnError: false
});

// 로그 헬퍼 함수들
export const logInfo = (message, meta = {}) => {
  logger.info(message, { meta });
};

export const logError = (message, error) => {
  logger.error(message, { 
    stack: error?.stack,
    error: error?.message || error,
    meta: error
  });
};

export const logWarn = (message, meta = {}) => {
  logger.warn(message, { meta });
};

export const logDebug = (message, meta = {}) => {
  logger.debug(message, { meta });
};

export const logHttp = (message, meta = {}) => {
  logger.http(message, { meta });
};

export const logSilly = (message, meta = {}) => {
  logger.silly(message, { meta });
};

// 직접 로거 객체를 사용하고 싶을 때 위한 export
export default logger; 