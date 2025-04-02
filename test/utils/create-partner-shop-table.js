import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// 데이터베이스 설정
const mode = process.env.MODE || 'DEV';
let dbConfig;

if (mode === 'LOCAL') {
  dbConfig = {
    host: process.env.LOCAL_DB_HOST || 'localhost',
    user: process.env.LOCAL_DB_USER || 'root',
    password: process.env.LOCAL_DB_PASSWORD || '',
    database: process.env.LOCAL_DB_NAME || 'chaltteok',
    port: process.env.LOCAL_DB_PORT || '3306'
  };
} else if (mode === 'DEV') {
  dbConfig = {
    host: process.env.DEV_DB_HOST || 'localhost',
    user: process.env.DEV_DB_USER || 'root',
    password: process.env.DEV_DB_PASSWORD || '',
    database: process.env.DEV_DB_NAME || 'chaltteok',
    port: process.env.DEV_DB_PORT || '3306'
  };
} else {
  dbConfig = {
    host: process.env.PROD_DB_HOST,
    user: process.env.PROD_DB_USER,
    password: process.env.PROD_DB_PASSWORD,
    database: process.env.PROD_DB_NAME,
    port: process.env.PROD_DB_PORT || '3306'
  };
}

console.log('데이터베이스 설정:', JSON.stringify(dbConfig, null, 2));

/**
 * 제휴매장 테이블 생성 함수
 */
async function createPartnerShopTable() {
  let connection;
  
  try {
    console.log('데이터베이스에 연결 중...');
    connection = await mysql.createConnection(dbConfig);
    
    // 테이블 생성
    const createTableSql = `
      CREATE TABLE IF NOT EXISTS partner_shop (
        id INT AUTO_INCREMENT PRIMARY KEY,
        shop_id INT NOT NULL,
        partner_date DATE NOT NULL,
        expiry_date DATE,
        status ENUM('active', 'expired', 'terminated') NOT NULL DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_shop_id (shop_id),
        FOREIGN KEY (shop_id) REFERENCES shop(id) ON DELETE CASCADE
      )
    `;
    
    console.log('partner_shop 테이블 생성 중...');
    await connection.execute(createTableSql);
    console.log('partner_shop 테이블 생성 완료!');
    
    // 테스트용 데이터 삽입을 위해 기존 데이터 삭제
    console.log('기존 데이터 삭제 중...');
    await connection.execute('DELETE FROM partner_shop');
    console.log('기존 데이터 삭제 완료!');
    
    // 매장 테이블에서 존재하는 매장 ID 가져오기
    console.log('유효한 매장 ID 조회 중...');
    const [shopRows] = await connection.execute('SELECT id FROM shop LIMIT 5');
    
    if (shopRows.length === 0) {
      console.log('매장 테이블에 데이터가 없습니다.');
      return;
    }
    
    // 오늘 날짜와 1년 후 날짜 계산
    const today = new Date();
    const nextYear = new Date();
    nextYear.setFullYear(today.getFullYear() + 1);
    
    const todayFormatted = today.toISOString().split('T')[0]; // YYYY-MM-DD
    const nextYearFormatted = nextYear.toISOString().split('T')[0]; // YYYY-MM-DD
    
    // 테스트 데이터 삽입
    console.log('테스트 데이터 삽입 중...');
    
    const insertPromises = shopRows.map(async (shop, index) => {
      // status 값 설정: 첫 번째는 active, 두 번째는 expired, 나머지는 active
      let status;
      if (index === 0) status = 'active';
      else if (index === 1) status = 'expired';
      else status = 'active';
      
      const insertSql = `
        INSERT INTO partner_shop (shop_id, partner_date, expiry_date, status)
        VALUES (?, ?, ?, ?)
      `;
      
      await connection.execute(insertSql, [
        shop.id,
        todayFormatted,
        nextYearFormatted,
        status
      ]);
      
      return shop.id;
    });
    
    const insertedShopIds = await Promise.all(insertPromises);
    console.log(`${insertedShopIds.length}개의 제휴매장 데이터가 삽입되었습니다:`, insertedShopIds);
    
    // 삽입된 데이터 확인
    const [partnerShops] = await connection.execute(`
      SELECT ps.*, s.title 
      FROM partner_shop ps 
      JOIN shop s ON ps.shop_id = s.id 
      ORDER BY ps.id DESC 
      LIMIT 3
    `);
    
    console.log('삽입된 데이터 예시:', partnerShops);
    
  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('데이터베이스 연결 종료');
    }
    console.log('테스트 완료!');
  }
}

/**
 * 테이블 존재 여부 확인 함수
 */
async function checkTableExists(tableName) {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = ? 
      AND table_name = ?
    `, [dbConfig.database, tableName]);
    
    return rows[0].count > 0;
  } catch (error) {
    console.error('테이블 존재 여부 확인 중 오류 발생:', error);
    return false;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 메인 함수
async function main() {
  try {
    // partner_shop 테이블 생성 및 테스트 데이터 삽입
    const partnerShopTableExists = await checkTableExists('partner_shop');
    
    if (partnerShopTableExists) {
      console.log('partner_shop 테이블이 이미 존재합니다.');
    }
    
    await createPartnerShopTable();
    
  } catch (error) {
    console.error('오류 발생:', error);
  }
}

// 스크립트 실행
main(); 