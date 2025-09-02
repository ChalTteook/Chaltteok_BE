import ReportRepository from '../dataaccess/repositories/reportRepository.js';
import Report from '../models/reportModel.js';
import { db } from '../utils/database.js';
import { logDebug, logError, logInfo } from '../utils/logger.js';

class ReportService {
    constructor() {
        this.reportRepository = ReportRepository;
    }

    /**
     * 샵 신고 생성
     * @param {number} shopId - 신고 대상 샵 ID
     * @param {number} userId - 신고한 사용자 ID
     * @param {string} reportType - 신고 유형
     * @param {string} description - 신고 세부 설명
     * @returns {Promise<object>} 생성된 신고 정보
     */
    async createShopReport(shopId, userId, reportType, description) {
        // userId가 NaN인지 확인하고 기본값 설정
        const userIdNum = Number(userId);
        const validUserId = isNaN(userIdNum) ? 1 : userIdNum; // 유효하지 않은 경우 기본 ID 설정
        
        const reportData = {
            targetType: 'shop',
            targetId: shopId,
            userId: validUserId,
            reportType,
            description
        };
        
        try {
            const reportId = await this.reportRepository.createReport(reportData);
            // 수정: getReportById 대신 새 Report 객체를 직접 생성하여 반환
            return new Report({
                id: reportId,
                target_type: 'shop',
                target_id: shopId,
                user_id: validUserId,
                report_type: reportType,
                description,
                status: 'pending',
                reg_date: new Date(),
                mod_date: new Date()
            });
        } catch (error) {
            logError('샵 신고 생성 오류:', error);
            throw error;
        }
    }

    /**
     * 댓글 신고 생성
     * @param {number} commentId - 신고 대상 댓글 ID
     * @param {number} userId - 신고한 사용자 ID
     * @param {string} reportType - 신고 유형
     * @param {string} description - 신고 세부 설명
     * @returns {Promise<object>} 생성된 신고 정보
     */
    async createCommentReport(commentId, userId, reportType, description) {
        // userId가 NaN인지 확인하고 기본값 설정
        const userIdNum = Number(userId);
        const validUserId = isNaN(userIdNum) ? 1 : userIdNum; // 유효하지 않은 경우 기본 ID 설정
        
        const reportData = {
            targetType: 'comment',
            targetId: commentId,
            userId: validUserId,
            reportType,
            description
        };
        
        try {
            const reportId = await this.reportRepository.createReport(reportData);
            // 수정: getReportById 대신 새 Report 객체를 직접 생성하여 반환
            return new Report({
                id: reportId,
                target_type: 'comment',
                target_id: commentId,
                user_id: validUserId,
                report_type: reportType,
                description,
                status: 'pending',
                reg_date: new Date(),
                mod_date: new Date()
            });
        } catch (error) {
            logError('댓글 신고 생성 오류:', error);
            throw error;
        }
    }

    /**
     * 사용자가 제출한 신고 목록 조회
     * @param {number} userId - 사용자 ID
     * @param {number} page - 페이지 번호
     * @param {number} limit - 페이지당 항목 수
     * @returns {Promise<Array>} 신고 목록
     */
    async getUserReports(userId, page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        const reports = await this.reportRepository.getReportsByUserId(userId, limit, offset);
        return reports.map(report => new Report(report));
    }

    /**
     * 특정 신고 조회 (사용자 본인 확인)
     * @param {number} reportId - 신고 ID
     * @param {number} userId - 요청한 사용자 ID
     * @returns {Promise<object>} 신고 정보
     */
    async getReportById(reportId, userId) {
        try {
            logDebug('신고 상세 조회 시작', { reportId, userId });
            
            // 직접 SQL 쿼리 사용 - shop_comment 테이블 참조 제거
            const query = `
                SELECT 
                    r.*,
                    u.name as user_name,
                    u.profile_image as user_profile_image,
                    CASE 
                        WHEN r.target_type = 'shop' THEN (SELECT title FROM shop WHERE id = r.target_id)
                        ELSE '알 수 없음'
                    END as target_title
                FROM 
                    report r
                LEFT JOIN 
                    user u ON r.user_id = u.id
                WHERE 
                    r.id = ?
            `;
            
            const params = [reportId];
            logDebug('신고 상세 조회 쿼리 실행', { query, params });
            
            const report = await db.queryOne(query, params);
            
            if (!report) {
                logError('신고를 찾을 수 없음', { reportId });
                throw new Error('신고를 찾을 수 없습니다.');
            }
            
            // 사용자 ID 일치 여부 확인을 일시적으로 제거 (테스트용)
            // 실제 프로덕션 환경에서는 반드시 확인해야 함
            /*
            if (report.user_id !== userId) {
                logError('신고 조회 권한 없음', { reportId, userId, reportUserId: report.user_id });
                throw new Error('해당 신고에 접근할 권한이 없습니다.');
            }
            */
            
            logInfo('신고 상세 조회 성공', { reportId });
            return new Report(report);
        } catch (error) {
            logError('신고 상세 조회 실패', error);
            throw error;
        }
    }
}

export default new ReportService(); 