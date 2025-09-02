import mybatisMapper from 'mybatis-mapper';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../../utils/database.js';
import { logInfo, logError, logDebug, logWarn } from '../../utils/logger.js';

class ReportRepository {
    constructor() {
        this.format = {language: 'sql', indent: '  '};
        this.initialize();
    }

    async initialize() {
        try {
            const mapperPath = path.join(
                path.dirname(fileURLToPath(import.meta.url)), 
                '../mappers/reportMapper.xml'
            );
            logInfo('리포트 매퍼 로드됨:', mapperPath);
            mybatisMapper.createMapper([mapperPath]);
        } catch (err) {
            logError('리포트 매퍼 초기화 실패:', err);
            throw err;
        }
    }

    // 신고 생성
    async createReport(reportData) {
        try {
            const query = mybatisMapper.getStatement(
                'report',
                'createReport',
                reportData,
                this.format
            );
            logDebug('신고 생성 쿼리 실행', { reportData });
            const result = await db.execute(query);
            logInfo('신고 생성 성공', { reportId: result.insertId });
            return result.insertId;
        } catch (err) {
            logError('신고 생성 실패:', err);
            throw err;
        }
    }

    // 사용자가 제출한 신고 목록 조회
    async getReportsByUserId(userId, limit = 20, offset = 0) {
        try {
            const query = mybatisMapper.getStatement(
                'report',
                'getReportsByUserId',
                { userId, limit, offset },
                this.format
            );
            logDebug('사용자별 신고 목록 조회', { userId, limit, offset });
            return await db.query(query);
        } catch (err) {
            logError('사용자별 신고 목록 조회 실패:', err);
            throw err;
        }
    }

    // 특정 신고 조회
    async getReportById(reportId) {
        try {
            logDebug(`신고 ID로 상세 조회 시작: ${reportId}`);
            
            const query = `
                SELECT 
                    r.*,
                    u.name as user_name,
                    u.profile_image as user_profile_image,
                    ru.name as reviewer_name,
                    CASE 
                        WHEN r.target_type = 'shop' THEN (SELECT title FROM shop WHERE id = r.target_id)
                        ELSE '알 수 없음'
                    END as target_title
                FROM 
                    report r
                LEFT JOIN 
                    user u ON r.user_id = u.id
                LEFT JOIN
                    user ru ON r.reviewed_by = ru.id
                WHERE 
                    r.id = ?
            `;
            
            logDebug('신고 단일 조회', { reportId, query });
            const report = await db.queryOne(query, [reportId]);
            logDebug(`신고 상세 조회 결과: ${JSON.stringify(report)}`);
            return report;
        } catch (error) {
            logError('신고 단일 조회 실패:', { error });
            throw error;
        }
    }

    // 전체 신고 목록 조회 (관리자용)
    async getAllReports(status = null, targetType = null, limit = 20, offset = 0) {
        try {
            const query = mybatisMapper.getStatement(
                'report',
                'getAllReports',
                { status, targetType, limit, offset },
                this.format
            );
            logDebug('전체 신고 목록 조회', { status, targetType, limit, offset });
            return await db.query(query);
        } catch (err) {
            logError('전체 신고 목록 조회 실패:', err);
            throw err;
        }
    }

    // 특정 대상에 대한 신고 목록 조회
    async getReportsByTarget(targetType, targetId, limit = 20, offset = 0) {
        try {
            const query = mybatisMapper.getStatement(
                'report',
                'getReportsByTarget',
                { targetType, targetId, limit, offset },
                this.format
            );
            logDebug('대상별 신고 목록 조회', { targetType, targetId, limit, offset });
            return await db.query(query);
        } catch (err) {
            logError('대상별 신고 목록 조회 실패:', err);
            throw err;
        }
    }

    // 신고 상태 업데이트
    async updateReportStatus(reportId, status, adminComment, reviewedBy) {
        try {
            const query = mybatisMapper.getStatement(
                'report',
                'updateReportStatus',
                { reportId, status, adminComment, reviewedBy },
                this.format
            );
            logDebug('신고 상태 업데이트', { reportId, status, reviewedBy });
            await db.execute(query);
            logInfo('신고 상태 업데이트 성공', { reportId, status });
            return true;
        } catch (err) {
            logError('신고 상태 업데이트 실패:', err);
            throw err;
        }
    }

    // 신고 통계 조회
    async getReportStats() {
        try {
            const query = mybatisMapper.getStatement(
                'report',
                'getReportStats',
                {},
                this.format
            );
            logDebug('신고 통계 조회');
            return await db.query(query);
        } catch (err) {
            logError('신고 통계 조회 실패:', err);
            throw err;
        }
    }
}

export default new ReportRepository(); 