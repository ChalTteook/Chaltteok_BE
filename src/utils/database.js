import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logInfo, logError, logDebug } from './logger.js';

// dotenv 설정 - 환경 변수 로드 개선
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(path.join(__dirname, '../../.env'));

// 환경 변수 로드
dotenv.config();

// .env 파일 직접 로드 (환경 변수에 없을 경우)
if (!process.env.MODE && fs.existsSync(envPath)) {
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  for (const key in envConfig) {
    if (!process.env[key]) {
      process.env[key] = envConfig[key];
    }
  }
  logInfo('.env 파일에서 환경 변수를 로드했습니다', { path: envPath });
}

/**
 * 데이터베이스 연결 및 쿼리 실행을 관리하는 클래스
 */
class Database {
  constructor() {
    this.initialize();
  }

  /**
   * 데이터베이스 연결 풀 초기화
   */
  initialize() {
    // 환경 변수에서 NODE_ENV와 MODE 값 확인
    const nodeEnv = process.env.NODE_ENV || 'development';
    const mode = process.env.MODE || 'LOCAL';
    let dbConfig;

    // 모든 환경 변수 로깅 (디버깅용)
    logInfo('환경 변수 확인', {
      MODE: mode,
      NODE_ENV: nodeEnv,
      PROD_DB_HOST: process.env.PROD_DB_HOST,
      PROD_DB_USER: process.env.PROD_DB_USER,
      PROD_DB_PASSWORD: process.env.PROD_DB_PASSWORD ? '***설정됨***' : '설정되지 않음',
      PROD_DB_NAME: process.env.PROD_DB_NAME,
      PROD_DB_PORT: process.env.PROD_DB_PORT,
      JWT_SECRET_KEY: process.env.JWT_SECRET_KEY ? '***설정됨***' : '설정되지 않음',
    });

    // MODE 값이 우선적으로 적용되어야 함
    if (mode === 'PROD') {
      logInfo('운영 환경(PROD) 데이터베이스 사용');
      dbConfig = {
        host: process.env.PROD_DB_HOST,
        user: process.env.PROD_DB_USER,
        password: process.env.PROD_DB_PASSWORD,
        database: process.env.PROD_DB_NAME,
        port: process.env.PROD_DB_PORT,
      };
    } else if (mode === 'DEV') {
      logInfo('개발 서버(DEV) 데이터베이스 사용');
      dbConfig = {
        host: process.env.DEV_DB_HOST,
        user: process.env.DEV_DB_USER,
        password: process.env.DEV_DB_PASSWORD,
        database: process.env.DEV_DB_NAME,
        port: process.env.DEV_DB_PORT,
      };
    } else { 
      // NODE_ENV가 development이거나 MODE가 LOCAL인 경우 로컬 DB 사용
      logInfo('로컬 개발 환경 데이터베이스 사용');
      dbConfig = {
        host: process.env.LOCAL_DB_HOST,
        user: process.env.LOCAL_DB_USER,
        password: process.env.LOCAL_DB_PASSWORD,
        database: process.env.LOCAL_DB_NAME,
        port: process.env.LOCAL_DB_PORT,
      };
    }

    // 선택된 DB 설정 로깅
    logInfo('데이터베이스 설정 확인', {
      host: dbConfig.host,
      user: dbConfig.user,
      database: dbConfig.database,
      port: dbConfig.port,
    });

    // 향상된, 최적화된 풀 설정
    this.pool = mysql.createPool({
      ...dbConfig,
      dateStrings: true,
      connectionLimit: 20,         // 연결 한도 증가
      queueLimit: 50,              // 대기 큐 제한
      idleTimeout: 60000,          // 유휴 연결 타임아웃 (60초)
      enableKeepAlive: true,
      waitForConnections: true,
      connectTimeout: 10000
    });

    logInfo('데이터베이스 연결 풀이 초기화되었습니다', {
      host: dbConfig.host,
      database: dbConfig.database,
      connectionLimit: 20
    });
  }

  /**
   * 데이터베이스 연결 얻기
   * @returns {Promise<Connection>} 데이터베이스 연결 객체
   */
  async getConnection() {
    try {
      const connection = await this.pool.getConnection();
      logDebug('데이터베이스 연결 획득', { connectionId: connection.threadId });
      return connection;
    } catch (error) {
      logError('데이터베이스 연결 획득 실패', error);
      throw new DatabaseError('데이터베이스 연결을 얻을 수 없습니다', error);
    }
  }

  /**
   * 단일 쿼리 실행
   * @param {string} sql - SQL 쿼리
   * @param {Array|Object} [params=[]] - 쿼리 매개변수
   * @returns {Promise<Array>} 쿼리 결과
   */
  async query(sql, params = []) {
    let connection;
    try {
      connection = await this.getConnection();
      logDebug('쿼리 실행', { sql, params });
      
      const [results] = await connection.query(sql, params);
      return results;
    } catch (error) {
      logError('쿼리 실행 실패', { error, sql, params });
      throw new DatabaseError('쿼리 실행 중 오류가 발생했습니다', error);
    } finally {
      if (connection) {
        connection.release();
        logDebug('연결 반환 완료');
      }
    }
  }

  /**
   * 단일 행 조회 쿼리 실행
   * @param {string} sql - SQL 쿼리
   * @param {Array|Object} [params=[]] - 쿼리 매개변수
   * @returns {Promise<Object|null>} 조회된 행 또는 null
   */
  async queryOne(sql, params = []) {
    const results = await this.query(sql, params);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * INSERT 쿼리 실행 및 새 ID 반환
   * @param {string} sql - SQL 쿼리
   * @param {Array|Object} [params=[]] - 쿼리 매개변수
   * @returns {Promise<number>} 새로 삽입된 행의 ID
   */
  async insert(sql, params = []) {
    let connection;
    try {
      connection = await this.getConnection();
      logDebug('INSERT 쿼리 실행', { sql, params });
      
      const [result] = await connection.query(sql, params);
      return result.insertId;
    } catch (error) {
      logError('INSERT 쿼리 실행 실패', { error, sql, params });
      throw new DatabaseError('INSERT 쿼리 실행 중 오류가 발생했습니다', error);
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

  /**
   * UPDATE 또는 DELETE 쿼리 실행 및 영향 받은 행 수 반환
   * @param {string} sql - SQL 쿼리
   * @param {Array|Object} [params=[]] - 쿼리 매개변수
   * @returns {Promise<number>} 영향 받은 행의 수
   */
  async execute(sql, params = []) {
    let connection;
    try {
      connection = await this.getConnection();
      logDebug('UPDATE/DELETE 쿼리 실행', { sql, params });
      
      const [result] = await connection.query(sql, params);
      return result.affectedRows;
    } catch (error) {
      logError('UPDATE/DELETE 쿼리 실행 실패', { error, sql, params });
      throw new DatabaseError('UPDATE/DELETE 쿼리 실행 중 오류가 발생했습니다', error);
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

  /**
   * 트랜잭션 실행
   * 여러 쿼리를 하나의 트랜잭션으로 처리
   * @param {Function} callback - 트랜잭션 내에서 실행할 콜백 함수
   * @returns {Promise<any>} 콜백 함수의 반환값
   */
  async transaction(callback) {
    let connection;
    try {
      connection = await this.getConnection();
      await connection.beginTransaction();
      logDebug('트랜잭션 시작');
      
      const result = await callback(connection);
      
      await connection.commit();
      logDebug('트랜잭션 커밋 완료');
      
      return result;
    } catch (error) {
      if (connection) {
        await connection.rollback();
        logDebug('트랜잭션 롤백 완료');
      }
      logError('트랜잭션 실행 실패', error);
      throw new DatabaseError('트랜잭션 실행 중 오류가 발생했습니다', error);
    } finally {
      if (connection) {
        connection.release();
        logDebug('트랜잭션 연결 반환 완료');
      }
    }
  }

  /**
   * 배치 쿼리 실행
   * @param {Array<{sql: string, params: Array}>} queries - 실행할 쿼리 배열
   * @returns {Promise<Array>} 각 쿼리의 결과 배열
   */
  async batch(queries) {
    return this.transaction(async (connection) => {
      const results = [];
      for (const { sql, params = [] } of queries) {
        logDebug('배치 쿼리 실행', { sql, params });
        const [result] = await connection.query(sql, params);
        results.push(result);
      }
      return results;
    });
  }

  /**
   * 풀 종료 (애플리케이션 종료 시 호출)
   * @returns {Promise<void>}
   */
  async end() {
    try {
      await this.pool.end();
      logInfo('데이터베이스 연결 풀이 정상적으로 종료되었습니다');
    } catch (error) {
      logError('데이터베이스 연결 풀 종료 실패', error);
    }
  }
}

/**
 * 데이터베이스 관련 커스텀 에러 클래스
 */
class DatabaseError extends Error {
  constructor(message, originalError = null) {
    super(message);
    this.name = 'DatabaseError';
    this.originalError = originalError;
    this.stack = originalError ? originalError.stack : this.stack;
  }
}

// 싱글톤 인스턴스 생성
const db = new Database();

export { db, DatabaseError };