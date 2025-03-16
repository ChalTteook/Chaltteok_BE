import mybatisMapper from 'mybatis-mapper';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import CommentModel from '../models/commentModel.js';
import path from 'path';
import { fileURLToPath } from 'url';

// 환경 변수 로드
dotenv.config();

// 현재 파일의 디렉토리 경로 가져오기
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// XML 매퍼 로드
mybatisMapper.createMapper([
  path.join(__dirname, '../dataaccess/mappers/commentMapper.xml')
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

class CommentService {
  constructor() {
    this.pool = mysql.createPool(dbConfig);
    this.format = {language: 'sql', indent: '  '};
  }

  /**
   * 새 댓글 생성
   * @param {number} reviewId - 리뷰 ID
   * @param {number} userId - 사용자 ID
   * @param {string} content - 댓글 내용
   * @returns {Promise<object>} 생성된 댓글 정보
   */
  async createComment(reviewId, userId, content) {
    const connection = await this.pool.getConnection();
    try {
      // 댓글 생성 쿼리 실행
      const param = { reviewId, userId, content };
      const query = mybatisMapper.getStatement('CommentMapper', 'createComment', param, this.format);
      
      const [result] = await connection.query(query);
      
      // 생성된 댓글 ID 가져오기
      const commentId = result.insertId;
      
      // 생성된 댓글 정보 조회
      const commentQuery = mybatisMapper.getStatement(
        'CommentMapper', 
        'getCommentById', 
        { commentId },
        this.format
      );
      
      const [comments] = await connection.query(commentQuery);
      
      if (comments.length === 0) {
        throw new Error('댓글 생성 후 조회 실패');
      }
      
      return new CommentModel(comments[0]);
    } catch (error) {
      console.error('댓글 생성 중 오류 발생:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * 댓글 목록 조회
   * @param {number} reviewId - 리뷰 ID
   * @returns {Promise<Array>} 댓글 목록
   */
  async getCommentsByReviewId(reviewId) {
    const connection = await this.pool.getConnection();
    try {
      const param = { reviewId };
      const query = mybatisMapper.getStatement(
        'CommentMapper', 
        'getCommentsByReviewId', 
        param,
        this.format
      );
      
      const [rows] = await connection.query(query);
      
      // CommentModel 객체로 변환
      return rows.map(row => new CommentModel(row));
    } catch (error) {
      console.error('댓글 목록 조회 중 오류 발생:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * 댓글 수정
   * @param {number} commentId - 댓글 ID
   * @param {number} userId - 사용자 ID (권한 확인용)
   * @param {string} content - 수정할 댓글 내용
   * @returns {Promise<boolean>} 수정 성공 여부
   */
  async updateComment(commentId, userId, content) {
    const connection = await this.pool.getConnection();
    try {
      // 댓글 소유권 확인
      const ownershipQuery = mybatisMapper.getStatement(
        'CommentMapper',
        'checkCommentOwnership',
        { commentId, userId },
        this.format
      );
      
      const [ownershipResult] = await connection.query(ownershipQuery);
      
      if (ownershipResult[0].count === 0) {
        throw new Error('댓글 수정 권한이 없습니다');
      }
      
      // 댓글 수정 쿼리 실행
      const param = { id: commentId, userId, content };
      const query = mybatisMapper.getStatement(
        'CommentMapper', 
        'updateComment', 
        param,
        this.format
      );
      
      const [result] = await connection.query(query);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('댓글 수정 중 오류 발생:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * 댓글 삭제 (논리적 삭제)
   * @param {number} commentId - 댓글 ID
   * @param {number} userId - 사용자 ID (권한 확인용)
   * @returns {Promise<boolean>} 삭제 성공 여부
   */
  async deleteComment(commentId, userId) {
    const connection = await this.pool.getConnection();
    try {
      // 댓글 소유권 확인
      const ownershipQuery = mybatisMapper.getStatement(
        'CommentMapper',
        'checkCommentOwnership',
        { commentId, userId },
        this.format
      );
      
      const [ownershipResult] = await connection.query(ownershipQuery);
      
      if (ownershipResult[0].count === 0) {
        throw new Error('댓글 삭제 권한이 없습니다');
      }
      
      // 댓글 삭제 쿼리 실행 (논리적 삭제)
      const param = { id: commentId, userId };
      const query = mybatisMapper.getStatement(
        'CommentMapper', 
        'deleteComment', 
        param,
        this.format
      );
      
      const [result] = await connection.query(query);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('댓글 삭제 중 오류 발생:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
}

export default new CommentService(); 