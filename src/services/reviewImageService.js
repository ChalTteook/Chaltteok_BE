import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuid4 } from 'uuid';
import mybatisMapper from 'mybatis-mapper';
import { db } from '../utils/database.js';
import { logInfo, logError, logDebug, logWarn } from '../utils/logger.js';
import { uploadToR2, getR2Url, deleteFromR2 } from '../utils/r2Util.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const mapperPath = path.join(__dirname, '../dataaccess/mappers/reviewMapper.xml');
mybatisMapper.createMapper([mapperPath]);

class ReviewImageService {
  constructor() {
    this.format = { language: 'sql', indent: '  ' };
  }

  /**
   * 리뷰 권한 확인
   */
  async checkReviewOwnership(reviewId, userId) {
    logDebug('리뷰 권한 확인 시작', { reviewId, userId });
    try {
      const param = { reviewId, userId };
      const query = mybatisMapper.getStatement(
        'ReviewMapper',
        'checkReviewOwnership',
        param,
        this.format
      );
      logDebug('권한 확인 쿼리 실행', { query });
      const result = await db.queryOne(query);
      logDebug('권한 확인 결과', { result });
      return result && result.count > 0;
    } catch (error) {
      logError('리뷰 권한 확인 중 오류 발생', error);
      throw error;
    }
  }

  /**
   * 리뷰 이미지 업로드 (R2 기반)
   */
  async uploadImage(reviewId, userId, file, imageIndex) {
    logDebug('이미지 업로드 시작', { reviewId, userId, imageIndex, fileSize: file?.size });
    try {
      // 권한 확인
      const hasPermission = await this.checkReviewOwnership(reviewId, userId);
      if (!hasPermission) {
        logWarn('리뷰 이미지 업로드 권한 없음', { reviewId, userId });
        throw new Error('리뷰 이미지 업로드 권한이 없습니다');
      }
      // 파일 확장자 추출
      const ext = file.originalname.split('.').pop().toLowerCase();
      logDebug('파일 확장자 확인', { extension: ext });
      // 허용된 이미지 확장자 확인
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
      if (!allowedExtensions.includes(ext)) {
        logWarn('허용되지 않는 파일 형식', { extension: ext });
        throw new Error('허용되지 않는 파일 형식입니다. JPG, PNG, GIF 파일만 업로드 가능합니다.');
      }
      // 최대 파일 크기 확인 (5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        logWarn('파일 크기 초과', { size: file.size, maxSize });
        throw new Error('파일 크기가 너무 큽니다. 최대 5MB까지 업로드 가능합니다.');
      }
      // 파일 이름 생성 (고유 ID + 원본 확장자)
      const fileName = `${reviewId}_${imageIndex}_${uuid4()}.${ext}`;
      const r2Key = `review-images/${fileName}`;
      // R2에 업로드
      const imageUrl = await uploadToR2(r2Key, file.buffer, file.mimetype);
      // DB에 이미지 URL 업데이트를 트랜잭션으로 실행
      return await db.transaction(async (connection) => {
        const queryId = `updateImage${imageIndex}`;
        const param = { reviewId, userId, imageUrl };
        logDebug('이미지 URL 업데이트 파라미터', param);
        const query = mybatisMapper.getStatement('ReviewMapper', queryId, param, this.format);
        logDebug('이미지 URL 업데이트 쿼리', { query });
        const [result] = await connection.query(query);
        logDebug('이미지 URL 업데이트 결과', { affectedRows: result.affectedRows });
        if (result.affectedRows === 0) {
          // 실패 시 R2에서 파일 삭제 및 에러 발생
          await deleteFromR2(r2Key);
          logWarn('이미지 URL 업데이트 실패', { reviewId, imageIndex });
          throw new Error('이미지 URL 업데이트 실패');
        }
        logInfo('이미지 업로드 성공', { imageUrl, reviewId, imageIndex });
        return imageUrl;
      });
    } catch (error) {
      logError('이미지 업로드 처리 중 오류 발생', error);
      throw error;
    }
  }

  /**
   * 리뷰 이미지 삭제
   */
  async deleteImage(reviewId, userId, imageIndex) {
    logDebug('이미지 삭제 시작', { reviewId, userId, imageIndex });
    // 권한 확인
    const hasPermission = await this.checkReviewOwnership(reviewId, userId);
    if (!hasPermission) {
      logWarn('리뷰 이미지 삭제 권한 없음', { reviewId, userId });
      throw new Error('리뷰 이미지 삭제 권한이 없습니다');
    }
    try {
      const queryId = `deleteImage${imageIndex}`;
      const param = { reviewId, userId };
      const query = mybatisMapper.getStatement('ReviewMapper', queryId, param, this.format);
      logDebug('이미지 삭제 쿼리 실행', { query });
      const affectedRows = await db.execute(query);
      const success = affectedRows > 0;
      if (success) {
        logInfo('이미지 삭제 성공', { reviewId, imageIndex });
      } else {
        logWarn('이미지 삭제 실패 (영향 받은 행 없음)', { reviewId, imageIndex });
      }
      return success;
    } catch (error) {
      logError('이미지 삭제 중 오류 발생', error);
      throw error;
    }
  }
}

export default new ReviewImageService(); 