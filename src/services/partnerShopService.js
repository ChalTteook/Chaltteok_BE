import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// 현재 모드에 따른 DB 설정 가져오기
const mode = process.env.MODE || 'DEV';
const dbPrefix = mode === 'PROD' ? 'PROD' : mode === 'DEV' ? 'DEV' : 'LOCAL';

// 데이터베이스 연결 설정
const dbConfig = {
  host: process.env[`${dbPrefix}_DB_HOST`] || 'localhost',
  user: process.env[`${dbPrefix}_DB_USER`] || 'root',
  password: process.env[`${dbPrefix}_DB_PASSWORD`] || '',
  database: process.env[`${dbPrefix}_DB_NAME`] || 'chaltteok',
  port: process.env[`${dbPrefix}_DB_PORT`] || '3306'
};

class PartnerShopService {
  /**
   * 제휴매장 목록 조회
   * @param {number} page - 페이지 번호
   * @param {number} limit - 페이지당 항목 수
   * @param {string} status - 필터링할 상태 (active, expired, terminated)
   * @returns {Promise<{total: number, data: Array}>} 총 개수와 제휴매장 목록
   */
  async getPartnerShops(page = 1, limit = 20, status = null) {
    let connection;
    try {
      connection = await mysql.createConnection(dbConfig);
      
      const offset = (page - 1) * limit;
      let queryParams = [limit, offset];
      let statusFilter = '';
      
      if (status) {
        statusFilter = 'WHERE ps.status = ?';
        queryParams.unshift(status);
      }
      
      // 총 개수 쿼리
      let countQuery = `
        SELECT COUNT(*) as total 
        FROM partner_shop ps 
        ${statusFilter}
      `;
      
      // 데이터 조회 쿼리
      let selectQuery = `
        SELECT ps.*, s.title 
        FROM partner_shop ps 
        JOIN shop s ON ps.shop_id = s.id 
        ${statusFilter}
        ORDER BY ps.id DESC 
        LIMIT ? OFFSET ?
      `;
      
      const [countRows] = await connection.execute(countQuery, status ? [status] : []);
      const [rows] = await connection.execute(selectQuery, queryParams);
      
      return {
        total: countRows[0].total,
        data: rows
      };
    } catch (error) {
      console.error('제휴매장 목록 조회 중 오류:', error);
      throw new Error('제휴매장 목록 조회 중 오류가 발생했습니다.');
    } finally {
      if (connection) await connection.end();
    }
  }

  /**
   * 특정 제휴매장 상세 정보 조회
   * @param {number} shopId - 매장 ID
   * @returns {Promise<Object>} 제휴매장 정보
   */
  async getPartnerShopById(shopId) {
    let connection;
    try {
      connection = await mysql.createConnection(dbConfig);
      
      const [rows] = await connection.execute(`
        SELECT ps.*, s.title 
        FROM partner_shop ps 
        JOIN shop s ON ps.shop_id = s.id 
        WHERE ps.shop_id = ?
      `, [shopId]);
      
      if (rows.length === 0) {
        throw new Error('해당 제휴매장을 찾을 수 없습니다.');
      }
      
      return rows[0];
    } catch (error) {
      console.error('제휴매장 상세 정보 조회 중 오류:', error);
      throw error;
    } finally {
      if (connection) await connection.end();
    }
  }

  /**
   * 제휴매장 등록
   * @param {number} shopId - 매장 ID
   * @param {string} partnerDate - 제휴 시작일 (YYYY-MM-DD)
   * @param {string} expiryDate - 제휴 만료일 (YYYY-MM-DD)
   * @returns {Promise<Object>} 등록된 제휴매장 정보
   */
  async addPartnerShop(shopId, partnerDate, expiryDate) {
    let connection;
    try {
      connection = await mysql.createConnection(dbConfig);
      
      // 이미 등록된 제휴매장인지 확인
      const [existing] = await connection.execute(`
        SELECT * FROM partner_shop WHERE shop_id = ?
      `, [shopId]);
      
      if (existing.length > 0) {
        throw new Error('이미 제휴매장으로 등록된 매장입니다.');
      }
      
      // shop 테이블에 해당 매장이 존재하는지 확인
      const [shop] = await connection.execute(`
        SELECT * FROM shop WHERE id = ?
      `, [shopId]);
      
      if (shop.length === 0) {
        throw new Error('등록하려는 매장이 존재하지 않습니다.');
      }
      
      // 제휴매장 등록
      await connection.execute(`
        INSERT INTO partner_shop (shop_id, partner_date, expiry_date, status)
        VALUES (?, ?, ?, 'active')
      `, [shopId, partnerDate, expiryDate]);
      
      // 등록된 제휴매장 정보 조회
      const [newPartnerShop] = await connection.execute(`
        SELECT ps.*, s.title 
        FROM partner_shop ps 
        JOIN shop s ON ps.shop_id = s.id 
        WHERE ps.shop_id = ?
      `, [shopId]);
      
      return newPartnerShop[0];
    } catch (error) {
      console.error('제휴매장 등록 중 오류:', error);
      throw error;
    } finally {
      if (connection) await connection.end();
    }
  }

  /**
   * 제휴매장 정보 업데이트
   * @param {number} shopId - 매장 ID
   * @param {Object} updateData - 업데이트할 데이터 객체
   * @returns {Promise<Object>} 업데이트된 제휴매장 정보
   */
  async updatePartnerShop(shopId, updateData) {
    let connection;
    try {
      connection = await mysql.createConnection(dbConfig);
      
      // 제휴매장이 존재하는지 확인
      const [existing] = await connection.execute(`
        SELECT * FROM partner_shop WHERE shop_id = ?
      `, [shopId]);
      
      if (existing.length === 0) {
        throw new Error('해당 제휴매장을 찾을 수 없습니다.');
      }
      
      // 업데이트할 필드와 값을 동적으로 구성
      const updates = [];
      const params = [];
      
      if (updateData.partnerDate) {
        updates.push('partner_date = ?');
        params.push(updateData.partnerDate);
      }
      
      if (updateData.expiryDate) {
        updates.push('expiry_date = ?');
        params.push(updateData.expiryDate);
      }
      
      if (updateData.status) {
        updates.push('status = ?');
        params.push(updateData.status);
      }
      
      if (updates.length === 0) {
        throw new Error('업데이트할 데이터가 없습니다.');
      }
      
      // 업데이트 쿼리 실행
      params.push(shopId);
      await connection.execute(`
        UPDATE partner_shop
        SET ${updates.join(', ')}
        WHERE shop_id = ?
      `, params);
      
      // 업데이트된 제휴매장 정보 조회
      const [updated] = await connection.execute(`
        SELECT ps.*, s.title 
        FROM partner_shop ps 
        JOIN shop s ON ps.shop_id = s.id 
        WHERE ps.shop_id = ?
      `, [shopId]);
      
      return updated[0];
    } catch (error) {
      console.error('제휴매장 정보 업데이트 중 오류:', error);
      throw error;
    } finally {
      if (connection) await connection.end();
    }
  }

  /**
   * 제휴매장 삭제
   * @param {number} shopId - 매장 ID
   * @returns {Promise<boolean>} 삭제 성공 여부
   */
  async deletePartnerShop(shopId) {
    let connection;
    try {
      connection = await mysql.createConnection(dbConfig);
      
      // 제휴매장이 존재하는지 확인
      const [existing] = await connection.execute(`
        SELECT * FROM partner_shop WHERE shop_id = ?
      `, [shopId]);
      
      if (existing.length === 0) {
        throw new Error('해당 제휴매장을 찾을 수 없습니다.');
      }
      
      // 제휴매장 삭제
      await connection.execute(`
        DELETE FROM partner_shop WHERE shop_id = ?
      `, [shopId]);
      
      return true;
    } catch (error) {
      console.error('제휴매장 삭제 중 오류:', error);
      throw error;
    } finally {
      if (connection) await connection.end();
    }
  }
}

export default new PartnerShopService(); 