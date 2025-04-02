import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 현재 파일의 디렉토리 경로 가져오기
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 환경 변수 로드
dotenv.config();

// SQL 정의
const createTableSQL = `
-- 댓글 테이블 생성
CREATE TABLE IF NOT EXISTS comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  review_id INT NOT NULL,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- 외래 키 제약조건
  CONSTRAINT fk_comments_review FOREIGN KEY (review_id) 
    REFERENCES shop_review(id) 
    ON DELETE CASCADE,
  
  CONSTRAINT fk_comments_user FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE,
  
  -- 인덱스
  INDEX idx_comments_review_id (review_id),
  INDEX idx_comments_user_id (user_id),
  INDEX idx_comments_created_at (created_at)
)
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

async function main() {
  let connection;
  
  try {
    // 프로덕션 DB 설정
    const prodConfig = {
      host: process.env.PROD_DB_HOST,
      user: process.env.PROD_DB_USER,
      password: process.env.PROD_DB_PASSWORD,
      database: process.env.PROD_DB_NAME,
      port: process.env.PROD_DB_PORT
    };
    
    console.log('프로덕션 데이터베이스 연결 시도 중...');
    try {
      connection = await mysql.createConnection(prodConfig);
      console.log('프로덕션 데이터베이스 연결 성공');
    } catch (prodError) {
      console.error('프로덕션 데이터베이스 연결 실패:', prodError.message);
      
      // 로컬 DB 설정으로 시도
      const localConfig = {
        host: process.env.LOCAL_DB_HOST,
        user: process.env.LOCAL_DB_USER,
        password: process.env.LOCAL_DB_PASSWORD,
        database: process.env.LOCAL_DB_NAME,
        port: process.env.LOCAL_DB_PORT
      };
      
      console.log('로컬 데이터베이스 연결 시도 중...');
      connection = await mysql.createConnection(localConfig);
      console.log('로컬 데이터베이스 연결 성공');
    }
    
    // SQL 실행
    console.log('댓글 테이블 생성 SQL 실행 중...');
    await connection.query(createTableSQL);
    
    console.log('댓글 테이블 생성 완료');
    
    // 테이블 확인
    const [tables] = await connection.query(`SHOW TABLES LIKE 'comments'`);
    if (tables.length > 0) {
      console.log('댓글 테이블이 성공적으로 생성되었습니다.');
      
      // 테이블 구조 확인
      const [columns] = await connection.query(`DESCRIBE comments`);
      console.log('댓글 테이블 구조:');
      columns.forEach(column => {
        console.log(`  ${column.Field}: ${column.Type} ${column.Null === 'YES' ? '(nullable)' : '(not null)'} ${column.Key ? `(${column.Key})` : ''}`);
      });
    } else {
      console.log('댓글 테이블 생성 실패');
    }
    
  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('데이터베이스 연결 종료');
    }
  }
}

main().catch(err => {
  console.error('프로그램 실행 중 오류 발생:', err);
}); 