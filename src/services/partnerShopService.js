import path from 'path';
import { fileURLToPath } from 'url';
import mybatisMapper from 'mybatis-mapper';
import { db } from '../utils/database.js';
import { logDebug, logInfo, logWarn } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
mybatisMapper.createMapper([
  path.join(__dirname, '../dataaccess/mappers/partnerShopMapper.xml')
]);

const format = { language: 'sql', indent: '  ' };

class PartnerShopService {
  /**
   * 제휴매장 목록 조회
   * @param {number} page - 페이지 번호
   * @param {number} limit - 페이지당 항목 수
   * @param {string} status - 필터링할 상태 (active, expired, terminated)
   * @returns {Promise<{total: number, data: Array}>} 총 개수와 제휴매장 목록
   */
  async getPartnerShops(page = 1, limit = 20, status = null) {
    const offset = (page - 1) * limit;
    const param = { limit, offset, status };
    logDebug('제휴매장 목록 조회 파라미터', param);
    const countSql = mybatisMapper.getStatement('PartnerShopMapper', 'countPartnerShops', param, format);
    const listSql = mybatisMapper.getStatement('PartnerShopMapper', 'selectPartnerShops', param, format);
    const totalRows = await db.queryOne(countSql);
    const rows = await db.query(listSql);
    return { total: totalRows.total, data: rows };
  }

  /**
   * 특정 제휴매장 상세 정보 조회
   * @param {number} shopId - 매장 ID
   * @returns {Promise<Object>} 제휴매장 정보
   */
  async getPartnerShopById(shopId) {
    const param = { shopId };
    const sql = mybatisMapper.getStatement('PartnerShopMapper', 'findByShopId', param, format);
    const rows = await db.query(sql);
    if (!rows || rows.length === 0) {
      throw new Error('해당 제휴매장을 찾을 수 없습니다.');
    }
    return rows[0];
  }

  /**
   * 제휴매장 등록
   * @param {number} shopId - 매장 ID
   * @param {string} partnerDate - 제휴 시작일 (YYYY-MM-DD)
   * @param {string} expiryDate - 제휴 만료일 (YYYY-MM-DD)
   * @returns {Promise<Object>} 등록된 제휴매장 정보
   */
  async addPartnerShop(shopId, partnerDate, expiryDate) {
    // 이미 등록 여부
    const existsSql = mybatisMapper.getStatement('PartnerShopMapper', 'findByShopId', { shopId }, format);
    const existing = await db.query(existsSql);
    if (existing && existing.length > 0) {
      throw new Error('이미 제휴매장으로 등록된 매장입니다.');
    }
    // shop 존재 확인
    const existsShopSql = mybatisMapper.getStatement('PartnerShopMapper', 'existsShopById', { shopId }, format);
    const existsShop = await db.queryOne(existsShopSql);
    if (!existsShop || existsShop.cnt === 0) {
      throw new Error('등록하려는 매장이 존재하지 않습니다.');
    }
    // 삽입
    const insertSql = mybatisMapper.getStatement('PartnerShopMapper', 'insertPartnerShop', { shopId, partnerDate, expiryDate }, format);
    await db.execute(insertSql);
    // 조회
    const findSql = mybatisMapper.getStatement('PartnerShopMapper', 'findByShopId', { shopId }, format);
    const rows = await db.query(findSql);
    return rows[0];
  }

  /**
   * 제휴매장 정보 업데이트
   * @param {number} shopId - 매장 ID
   * @param {Object} updateData - 업데이트할 데이터 객체
   * @returns {Promise<Object>} 업데이트된 제휴매장 정보
   */
  async updatePartnerShop(shopId, updateData) {
    // 존재 확인
    const existing = await db.query(mybatisMapper.getStatement('PartnerShopMapper', 'findByShopId', { shopId }, format));
    if (!existing || existing.length === 0) {
      throw new Error('해당 제휴매장을 찾을 수 없습니다.');
    }
    // 업데이트 실행
    const updateSql = mybatisMapper.getStatement('PartnerShopMapper', 'updatePartnerShop', { shopId, ...updateData }, format);
    await db.execute(updateSql);
    // 결과 조회
    const rows = await db.query(mybatisMapper.getStatement('PartnerShopMapper', 'findByShopId', { shopId }, format));
    return rows[0];
  }

  /**
   * 제휴매장 삭제
   * @param {number} shopId - 매장 ID
   * @returns {Promise<boolean>} 삭제 성공 여부
   */
  async deletePartnerShop(shopId) {
    const existing = await db.query(mybatisMapper.getStatement('PartnerShopMapper', 'findByShopId', { shopId }, format));
    if (!existing || existing.length === 0) {
      throw new Error('해당 제휴매장을 찾을 수 없습니다.');
    }
    const delSql = mybatisMapper.getStatement('PartnerShopMapper', 'deleteByShopId', { shopId }, format);
    await db.execute(delSql);
    return true;
  }
}

export default new PartnerShopService(); 