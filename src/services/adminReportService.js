import ReportRepository from '../dataaccess/repositories/reportRepository.js';
import Report from '../models/reportModel.js';

class AdminReportService {
    constructor() {
        this.reportRepository = ReportRepository;
    }

    /**
     * 전체 신고 목록 조회
     * @param {string} status - 신고 상태 필터
     * @param {string} targetType - 대상 타입 필터
     * @param {number} page - 페이지 번호
     * @param {number} limit - 페이지당 항목 수
     * @returns {Promise<Array>} 신고 목록
     */
    async getAllReports(status = null, targetType = null, page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        const reports = await this.reportRepository.getAllReports(status, targetType, limit, offset);
        return reports.map(report => new Report(report));
    }

    /**
     * 특정 신고 조회 (관리자용)
     * @param {number} reportId - 신고 ID
     * @returns {Promise<object>} 신고 정보
     */
    async getReportById(reportId) {
        const report = await this.reportRepository.getReportById(reportId);
        
        if (!report) {
            throw new Error('신고를 찾을 수 없습니다.');
        }
        
        return new Report(report);
    }

    /**
     * 특정 대상에 대한 신고 목록 조회
     * @param {string} targetType - 대상 타입 (shop, comment)
     * @param {number} targetId - 대상 ID
     * @param {number} page - 페이지 번호
     * @param {number} limit - 페이지당 항목 수
     * @returns {Promise<Array>} 신고 목록
     */
    async getReportsByTarget(targetType, targetId, page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        const reports = await this.reportRepository.getReportsByTarget(targetType, targetId, limit, offset);
        return reports.map(report => new Report(report));
    }

    /**
     * 신고 상태 업데이트
     * @param {number} reportId - 신고 ID
     * @param {string} status - 업데이트할 상태
     * @param {string} adminComment - 관리자 코멘트
     * @param {number} adminId - 관리자 ID
     * @returns {Promise<object>} 업데이트된 신고 정보
     */
    async updateReportStatus(reportId, status, adminComment, adminId) {
        // 상태 유효성 검사
        const validStatuses = ['pending', 'in_review', 'resolved', 'rejected'];
        if (!validStatuses.includes(status)) {
            throw new Error('유효하지 않은 상태값입니다.');
        }
        
        await this.reportRepository.updateReportStatus(reportId, status, adminComment, adminId);
        return this.getReportById(reportId);
    }

    /**
     * 신고 통계 정보 조회
     * @returns {Promise<object>} 신고 통계 정보
     */
    async getReportStats() {
        const stats = await this.reportRepository.getReportStats();
        
        if (stats.length === 0) {
            return {
                totalReports: 0,
                pending: 0,
                inReview: 0,
                resolved: 0,
                rejected: 0,
                byTargetType: {
                    shop: 0,
                    comment: 0
                },
                byReportType: {
                    spam: 0,
                    inappropriate: 0,
                    fraud: 0,
                    offensive: 0,
                    harassment: 0,
                    others: 0
                }
            };
        }
        
        const stat = stats[0];
        
        return {
            totalReports: stat.total_reports,
            pending: stat.pending,
            inReview: stat.in_review,
            resolved: stat.resolved,
            rejected: stat.rejected,
            byTargetType: {
                shop: stat.shop_reports,
                comment: stat.comment_reports
            },
            byReportType: {
                spam: stat.spam,
                inappropriate: stat.inappropriate,
                fraud: stat.fraud,
                offensive: stat.offensive,
                harassment: stat.harassment,
                others: stat.others
            }
        };
    }
}

export default new AdminReportService(); 