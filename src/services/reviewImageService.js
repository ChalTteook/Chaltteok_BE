import mybatisMapper from 'mybatis-mapper';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import uuid4 from 'uuid4';

// 환경 변수 로드
dotenv.config();

// 현재 파일의 디렉토리 경로 가져오기
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// XML 매퍼 로드
mybatisMapper.createMapper([
  path.join(__dirname, '../dataaccess/mappers/reviewMapper.xml')
]);

// 데이터베이스 연결 설정
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// 업로드 디렉토리 경로
const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'review-images');

// 업로드 디렉토리가 존재하지 않으면 생성
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

class ReviewImageService {
  constructor() {
    this.pool = mysql.createPool(dbConfig);
    this.format = {language: 'sql', indent: '  '};
  }

  /**
   * 리뷰 권한 확인
   * @param {number} reviewId - 리뷰 ID
   * @param {number} userId - 사용자 ID
   * @returns {Promise<boolean>} 권한 여부
   */
  async checkReviewOwnership(reviewId, userId) {
    const connection = await this.pool.getConnection();
    try {
      const param = { reviewId, userId };
      const query = mybatisMapper.getStatement(
        'ReviewMapper',
        'checkReviewOwnership',
        param,
        this.format
      );
      
      const [result] = await connection.query(query);
      
      return result[0].count > 0;
    } catch (error) {
      console.error('리뷰 권한 확인 중 오류 발생:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * 리뷰 이미지 업로드
   * @param {number} reviewId - 리뷰 ID
   * @param {number} userId - 사용자 ID
   * @param {object} file - 업로드된 파일 객체
   * @param {number} imageIndex - 이미지 인덱스 (1~5)
   * @returns {Promise<string>} 저장된 이미지 URL
   */
  async uploadImage(reviewId, userId, file, imageIndex) {
    // 권한 확인
    const hasPermission = await this.checkReviewOwnership(reviewId, userId);
    if (!hasPermission) {
      throw new Error('리뷰 이미지 업로드 권한이 없습니다');
    }

    // 파일 확장자 추출
    const ext = path.extname(file.originalname).toLowerCase();
    
    // 허용된 이미지 확장자 확인
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
    if (!allowedExtensions.includes(ext)) {
      throw new Error('허용되지 않는 파일 형식입니다. JPG, PNG, GIF 파일만 업로드 가능합니다.');
    }
    
    // 최대 파일 크기 확인 (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('파일 크기가 너무 큽니다. 최대 5MB까지 업로드 가능합니다.');
    }
    
    // 파일 이름 생성 (고유 ID + 원본 확장자)
    const fileName = `${reviewId}_${imageIndex}_${uuid4()}${ext}`;
    const filePath = path.join(UPLOAD_DIR, fileName);
    
    // 이전 이미지 URL 삭제 처리를 위한 리뷰 정보 조회
    // (이 부분이 필요하면 기존 이미지 조회하여 삭제하는 코드 추가 필요)

    return new Promise((resolve, reject) => {
      // 파일 저장
      fs.writeFile(filePath, file.buffer, async (err) => {
        if (err) {
          console.error('파일 저장 중 오류 발생:', err);
          return reject(err);
        }
        
        // DB에 이미지 URL 업데이트
        try {
          const connection = await this.pool.getConnection();
          
          try {
            // 상대적 URL 경로 생성 (정적 파일 제공용)
            const imageUrl = `/uploads/review-images/${fileName}`;
            
            // 인덱스에 맞는 쿼리 선택
            const queryId = `updateImage${imageIndex}`;
            const param = { reviewId, userId, imageUrl };
            const query = mybatisMapper.getStatement('ReviewMapper', queryId, param, this.format);
            
            const [result] = await connection.query(query);
            
            if (result.affectedRows === 0) {
              throw new Error('이미지 URL 업데이트 실패');
            }
            
            resolve(imageUrl);
          } catch (error) {
            console.error('이미지 URL 업데이트 중 오류 발생:', error);
            // 파일은 저장되었으나 DB 업데이트 실패 시 파일 삭제
            fs.unlink(filePath, (unlinkErr) => {
              if (unlinkErr) console.error('임시 파일 삭제 실패:', unlinkErr);
            });
            reject(error);
          } finally {
            connection.release();
          }
        } catch (error) {
          console.error('DB 연결 중 오류 발생:', error);
          // 파일은 저장되었으나 DB 연결 실패 시 파일 삭제
          fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) console.error('임시 파일 삭제 실패:', unlinkErr);
          });
          reject(error);
        }
      });
    });
  }

  /**
   * 리뷰 이미지 삭제
   * @param {number} reviewId - 리뷰 ID
   * @param {number} userId - 사용자 ID
   * @param {number} imageIndex - 이미지 인덱스 (1~5)
   * @returns {Promise<boolean>} 삭제 성공 여부
   */
  async deleteImage(reviewId, userId, imageIndex) {
    // 권한 확인
    const hasPermission = await this.checkReviewOwnership(reviewId, userId);
    if (!hasPermission) {
      throw new Error('리뷰 이미지 삭제 권한이 없습니다');
    }
    
    const connection = await this.pool.getConnection();
    try {
      // 인덱스에 맞는 쿼리 선택
      const queryId = `deleteImage${imageIndex}`;
      const param = { reviewId, userId };
      const query = mybatisMapper.getStatement('ReviewMapper', queryId, param, this.format);
      
      const [result] = await connection.query(query);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('이미지 삭제 중 오류 발생:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
}

export default new ReviewImageService(); 