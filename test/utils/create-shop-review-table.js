import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// 환경 변수 로드
dotenv.config();

// 데이터베이스 설정 가져오기
const server = process.env.MODE;
let dbConfig;

if (server === 'DEV') {
  dbConfig = {
    host: process.env.DEV_DB_HOST,
    user: process.env.DEV_DB_USER,
    password: process.env.DEV_DB_PASSWORD,
    database: process.env.DEV_DB_NAME,
    port: process.env.DEV_DB_PORT,
  };
} else if (server === 'PROD') {
  dbConfig = {
    host: process.env.PROD_DB_HOST,
    user: process.env.PROD_DB_USER,
    password: process.env.PROD_DB_PASSWORD,
    database: process.env.PROD_DB_NAME,
    port: process.env.PROD_DB_PORT,
  };
} else { // 기본값은 로컬
  dbConfig = {
    host: process.env.LOCAL_DB_HOST,
    user: process.env.LOCAL_DB_USER,
    password: process.env.LOCAL_DB_PASSWORD,
    database: process.env.LOCAL_DB_NAME,
    port: process.env.LOCAL_DB_PORT,
  };
}

/**
 * shop_review 테이블을 생성하는 함수
 */
async function createShopReviewTable() {
  const pool = mysql.createPool(dbConfig);
  const connection = await pool.getConnection();
  
  try {
    console.log('데이터베이스에 연결되었습니다.');
    
    // 테이블이 이미 존재하는지 확인
    const tableExists = await checkTableExists(connection, 'shop_review');
    
    if (tableExists) {
      console.log('shop_review 테이블이 이미 존재합니다.');
    } else {
      // shop_review 테이블 생성 (외래 키 제약 조건 없음)
      const createTableQuery = `
        CREATE TABLE shop_review (
          id INT AUTO_INCREMENT PRIMARY KEY,
          shop_id BIGINT NOT NULL,
          shop_prd_id BIGINT DEFAULT 0,
          user_id INT NOT NULL,
          description TEXT NOT NULL,
          img_1 VARCHAR(255),
          img_2 VARCHAR(255),
          img_3 VARCHAR(255),
          img_4 VARCHAR(255),
          img_5 VARCHAR(255),
          like_count INT DEFAULT 0,
          reg_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          mod_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `;
      
      await connection.query(createTableQuery);
      console.log('shop_review 테이블이 성공적으로 생성되었습니다.');
    }
    
    // 테스트 데이터 삽입
    await insertTestData(connection);
    
  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    connection.release();
    pool.end();
  }
}

/**
 * 테이블이 존재하는지 확인하는 함수
 */
async function checkTableExists(connection, tableName) {
  try {
    const query = `
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_schema = ?
      AND table_name = ?;
    `;
    
    const [result] = await connection.query(query, [dbConfig.database, tableName]);
    return result[0].count > 0;
  } catch (error) {
    console.error('테이블 존재 여부 확인 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 테스트 데이터를 삽입하는 함수
 */
async function insertTestData(connection) {
  try {
    // 기존 데이터 삭제
    await connection.query('DELETE FROM shop_review');
    console.log('기존 shop_review 데이터가 삭제되었습니다.');
    
    // shop 테이블에서 유효한 shop_id 가져오기
    const [shops] = await connection.query('SELECT id FROM shop LIMIT 10');
    
    if (shops.length === 0) {
      console.error('테스트 데이터 삽입을 위한 shop 데이터가 없습니다.');
      return;
    }
    
    // 샘플 사용자 ID (하드코딩)
    const userIds = [1, 2, 3, 4, 5]; // 임의의 사용자 ID
    
    // 테스트 데이터 준비
    const testReviews = [];
    
    // 각 shop에 대해 여러 리뷰 생성
    for (let i = 0; i < shops.length; i++) {
      const shopId = shops[i].id;
      const reviewCount = Math.floor(Math.random() * 5) + 1; // 1~5개의 리뷰
      
      for (let j = 0; j < reviewCount; j++) {
        const userId = userIds[Math.floor(Math.random() * userIds.length)];
        
        testReviews.push([
          shopId,
          0,  // shop_prd_id는 0으로 설정
          userId,
          `이 가게는 ${j+1}번째 방문인데 매우 좋았습니다. 서비스와 품질 모두 만족스러웠어요!`,
          j % 2 === 0 ? 'https://example.com/image1.jpg' : null,  // 짝수 인덱스만 이미지
          null,
          null,
          null,
          null,
          Math.floor(Math.random() * 50)  // 0~49 사이의 좋아요 수
        ]);
      }
    }
    
    // 특정 매장에 대한 테스트 데이터 추가
    // shop_id 11670753에 대한 리뷰 추가
    testReviews.push([
      11670753, // 특정 매장 ID
      0, // shop_prd_id는 0으로 설정
      1, // 임의의 사용자 ID
      '특별히 지정된 매장에 대한 테스트 리뷰입니다. 매우 맛있고 서비스도 좋았습니다!',
      'https://example.com/special_image.jpg',
      null,
      null,
      null,
      null,
      25
    ]);
    
    // 데이터 삽입
    if (testReviews.length > 0) {
      const insertQuery = `
        INSERT INTO shop_review 
        (shop_id, shop_prd_id, user_id, description, img_1, img_2, img_3, img_4, img_5, like_count)
        VALUES ?
      `;
      
      await connection.query(insertQuery, [testReviews]);
      console.log(`${testReviews.length}개의 테스트 리뷰가 성공적으로 삽입되었습니다.`);
      
      // 삽입된 데이터 확인
      const [insertedRows] = await connection.query('SELECT * FROM shop_review LIMIT 5');
      console.log('삽입된 데이터 샘플:', insertedRows);
    } else {
      console.log('삽입할 테스트 데이터가 없습니다.');
    }
  } catch (error) {
    console.error('테스트 데이터 삽입 중 오류 발생:', error);
    throw error;
  }
}

// 테이블 생성 및 테스트 데이터 삽입 실행
createShopReviewTable()
  .then(() => console.log('스크립트 실행 완료'))
  .catch(err => console.error('스크립트 실행 중 오류 발생:', err)); 