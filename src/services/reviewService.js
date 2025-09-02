import mybatisMapper from 'mybatis-mapper';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../utils/database.js';
import ReviewModel from '../models/reviewModel.js';
import { logInfo, logError, logDebug, logWarn } from '../utils/logger.js';

// 현재 파일의 디렉토리 경로 가져오기
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// XML 매퍼 로드
mybatisMapper.createMapper([
  path.join(__dirname, '../dataaccess/mappers/reviewMapper.xml')
]);

class ReviewService {
  constructor() {
    this.format = {language: 'sql', indent: '  '};
  }

  /**
   * 리뷰 단일 조회
   * @param {number} reviewId - 리뷰 ID
   * @returns {Promise<object|null>} 리뷰 정보 또는 null
   */
  async getReviewById(reviewId) {
    logDebug('리뷰 단일 조회 시작', { reviewId });
    
    try {
      const param = { reviewId };
      const query = mybatisMapper.getStatement(
        'ReviewMapper', 
        'getReviewById', 
        param,
        this.format
      );
      
      const result = await db.queryOne(query);
      
      if (!result) {
        logDebug('리뷰를 찾을 수 없음', { reviewId });
        return null;
      }
      
      logDebug('리뷰 조회 성공', { reviewId });
      return new ReviewModel(result);
    } catch (error) {
      logError('리뷰 조회 중 오류 발생', error);
      throw error;
    }
  }

  /**
   * 매장별 리뷰 목록 조회
   * @param {number} shopId - 매장 ID
   * @param {number} page - 페이지 번호
   * @param {number} limit - 페이지당 항목 수
   * @returns {Promise<Array>} 리뷰 목록
   */
  async getReviewsByShopId(shopId, page = 1, limit = 20) {
    // 입력값 유효성 검증 및 안전한 형변환
    const validateNumber = (value, defaultValue, min, max) => {
      const parsed = parseInt(value, 10);
      if (isNaN(parsed)) return defaultValue;
      return Math.min(max, Math.max(min, parsed));
    };

    // 페이지 및 limit 값 검증 (최소 1, 최대 100)
    const validPage = validateNumber(page, 1, 1, 1000);
    const validLimit = validateNumber(limit, 20, 1, 100);
    const validShopId = validateNumber(shopId, 0, 0, Number.MAX_SAFE_INTEGER);
    
    // offset 계산
    const offset = (validPage - 1) * validLimit;
    
    logDebug('매장별 리뷰 목록 조회 시작', { shopId: validShopId, page: validPage, limit: validLimit, offset });
    
    try {
      const param = { 
        shopId: validShopId,
        offset: Number(offset),
        limit: Number(validLimit)
      };
      
      const query = mybatisMapper.getStatement(
        'ReviewMapper', 
        'getReviewsByShopId', 
        param,
        this.format
      );
      
      logDebug('리뷰 목록 쿼리 실행', { query, params: param });
      
      const results = await db.query(query);
      logInfo('리뷰 목록 조회 성공', { 
        shopId: validShopId, 
        page: validPage, 
        limit: validLimit, 
        count: results.length 
      });
      
      return results.map(row => new ReviewModel(row));
    } catch (error) {
      logError('매장별 리뷰 목록 조회 중 오류 발생', error);
      throw error;
    }
  }

  /**
   * 새 리뷰 생성
   * @param {number} shopId - 매장 ID
   * @param {number|null} shopPrdId - 매장 상품 ID (선택)
   * @param {number} userId - 사용자 ID
   * @param {string} description - 리뷰 내용
   * @returns {Promise<object>} 생성된 리뷰 정보
   */
  async createReview(shopId, shopPrdId, userId, description) {
    try {
      // 데이터 타입 변환 및 유효성 검사
      const safeShopId = parseInt(shopId, 10);
      const safeUserId = parseInt(userId, 10);
      const safeShopPrdId = shopPrdId ? parseInt(shopPrdId, 10) : 0;
      
      // 특수 문자 처리: XML 문제를 일으킬 수 있는 문자들을 이스케이프
      const safeDescription = description.trim()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/'/g, '&apos;')
        .replace(/"/g, '&quot;');
      
      const reviewData = { 
        shopId: safeShopId, 
        shopPrdId: safeShopPrdId, 
        userId: safeUserId,
        description: safeDescription 
      };
      
      logDebug('리뷰 생성 시작', reviewData);
      
      if (isNaN(safeShopId) || isNaN(safeUserId)) {
        logWarn('유효하지 않은 ID 값', { shopId: safeShopId, userId: safeUserId });
        throw new Error('유효하지 않은 ID 값입니다.');
      }
      
      if (!safeDescription) {
        logWarn('리뷰 내용 누락', { userId: safeUserId, shopId: safeShopId });
        throw new Error('리뷰 내용이 필요합니다.');
      }
      
      // 트랜잭션 사용하여 리뷰 생성
      return await db.transaction(async (connection) => {
        try {
          const param = reviewData;
          logDebug('MyBatis 매퍼 파라미터', param);
          
          const query = mybatisMapper.getStatement(
            'ReviewMapper', 
            'createReview', 
            param,
            this.format
          );
          
          logDebug('리뷰 생성 쿼리 실행', { query });
          
          const [result] = await connection.query(query);
          const reviewId = result.insertId;
          
          logInfo('리뷰 생성 성공', { 
            reviewId,
            shopId: safeShopId, 
            userId: safeUserId 
          });
          
          return this.getReviewById(reviewId);
        } catch (mybatisError) {
          logWarn('MyBatis 매퍼 오류, 직접 쿼리 시도', { error: mybatisError.message });
          
          // MyBatis 오류 시 직접 SQL 쿼리 생성
          logDebug('직접 SQL 쿼리 생성 시도');
          const directQuery = `
            INSERT INTO shop_review (shop_id, shop_prd_id, user_id, description) 
            VALUES (?, ?, ?, ?)
          `;
          
          const [directResult] = await connection.query(directQuery, [
            safeShopId, 
            safeShopPrdId, 
            safeUserId, 
            safeDescription
          ]);
          
          const reviewId = directResult.insertId;
          logInfo('직접 쿼리로 리뷰 생성 성공', { 
            reviewId,
            shopId: safeShopId, 
            userId: safeUserId 
          });
          
          return this.getReviewById(reviewId);
        }
      });
    } catch (error) {
      logError('리뷰 생성 중 오류 발생', {
        error: error.message,
        stack: error.stack,
        name: error.name
      });
      
      throw error;
    }
  }

  /**
   * 리뷰 수정
   * @param {number} reviewId - 리뷰 ID
   * @param {number} userId - 사용자 ID (권한 확인용)
   * @param {string} description - 수정할 리뷰 내용
   * @returns {Promise<object>} 수정된 리뷰 정보
   */
  async updateReview(reviewId, userId, description) {
    logDebug('리뷰 수정 시작', { reviewId, userId });
    
    // 리뷰 소유권 확인
    const hasOwnership = await this.checkReviewOwnership(reviewId, userId);
    if (!hasOwnership) {
      logWarn('리뷰 수정 권한 없음', { reviewId, userId });
      throw new Error('리뷰 수정 권한이 없습니다');
    }
    
    try {
      const param = { reviewId, userId, description };
      const query = mybatisMapper.getStatement(
        'ReviewMapper', 
        'updateReview', 
        param,
        this.format
      );
      
      logDebug('리뷰 수정 쿼리 실행', { query });
      
      await db.execute(query);
      
      logInfo('리뷰 수정 성공', { reviewId, userId });
      
      return this.getReviewById(reviewId);
    } catch (error) {
      logError('리뷰 수정 중 오류 발생', error);
      throw error;
    }
  }

  /**
   * 리뷰 삭제
   * @param {number} reviewId - 리뷰 ID
   * @param {number} userId - 사용자 ID (권한 확인용)
   * @returns {Promise<boolean>} 삭제 성공 여부
   */
  async deleteReview(reviewId, userId) {
    logDebug('리뷰 삭제 시작', { reviewId, userId });
    
    // 리뷰 소유권 확인
    const hasOwnership = await this.checkReviewOwnership(reviewId, userId);
    if (!hasOwnership) {
      logWarn('리뷰 삭제 권한 없음', { reviewId, userId });
      throw new Error('리뷰 삭제 권한이 없습니다');
    }
    
    try {
      const param = { reviewId, userId };
      const query = mybatisMapper.getStatement(
        'ReviewMapper', 
        'deleteReview', 
        param,
        this.format
      );
      
      logDebug('리뷰 삭제 쿼리 실행', { query });
      
      const affectedRows = await db.execute(query);
      const success = affectedRows > 0;
      
      if (success) {
        logInfo('리뷰 삭제 성공', { reviewId, userId });
      } else {
        logWarn('리뷰 삭제 실패 (영향 받은 행 없음)', { reviewId, userId });
      }
      
      return success;
    } catch (error) {
      logError('리뷰 삭제 중 오류 발생', error);
      throw error;
    }
  }

  /**
   * 리뷰 소유권 확인
   * @param {number} reviewId - 리뷰 ID
   * @param {number} userId - 사용자 ID
   * @returns {Promise<boolean>} 소유권 여부
   */
  async checkReviewOwnership(reviewId, userId) {
    logDebug('리뷰 소유권 확인', { reviewId, userId });
    
    try {
      const param = { reviewId, userId };
      const query = mybatisMapper.getStatement(
        'ReviewMapper',
        'checkReviewOwnership',
        param,
        this.format
      );
      
      const result = await db.queryOne(query);
      const hasOwnership = result.count > 0;
      
      logDebug('리뷰 소유권 확인 결과', { 
        reviewId, 
        userId, 
        hasOwnership 
      });
      
      return hasOwnership;
    } catch (error) {
      logError('리뷰 소유권 확인 중 오류 발생', error);
      throw error;
    }
  }

  /**
   * 리뷰 좋아요 증가
   * @param {number} reviewId - 리뷰 ID
   * @returns {Promise<boolean>} 성공 여부
   */
  async incrementLike(reviewId) {
    logDebug('리뷰 좋아요 증가 시작', { reviewId });
    
    try {
      const param = { reviewId };
      const query = mybatisMapper.getStatement(
        'ReviewMapper',
        'incrementLike',
        param,
        this.format
      );
      
      const affectedRows = await db.execute(query);
      const success = affectedRows > 0;
      
      if (success) {
        logInfo('리뷰 좋아요 증가 성공', { reviewId });
      } else {
        logWarn('리뷰 좋아요 증가 실패', { reviewId });
      }
      
      return success;
    } catch (error) {
      logError('좋아요 증가 중 오류 발생', error);
      throw error;
    }
  }

  /**
   * 리뷰 좋아요 취소
   * @param {number} reviewId - 리뷰 ID
   * @returns {Promise<boolean>} 성공 여부
   */
  async decrementLike(reviewId) {
    logDebug('리뷰 좋아요 취소 시작', { reviewId });
    
    try {
      const param = { reviewId };
      const query = mybatisMapper.getStatement(
        'ReviewMapper',
        'decrementLike',
        param,
        this.format
      );
      
      const affectedRows = await db.execute(query);
      const success = affectedRows > 0;
      
      if (success) {
        logInfo('리뷰 좋아요 취소 성공', { reviewId });
      } else {
        logWarn('리뷰 좋아요 취소 실패', { reviewId });
      }
      
      return success;
    } catch (error) {
      logError('좋아요 취소 중 오류 발생', error);
      throw error;
    }
  }
}

export default new ReviewService(); 