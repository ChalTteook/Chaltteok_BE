import express from 'express';
import ReportService from '../services/reportService.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { logInfo, logError, logDebug } from '../utils/logger.js';

const router = express.Router();

// 샵 신고하기
router.post('/shops/:shopId', authenticateToken, async (req, res) => {
    const { shopId } = req.params;
    const { reportType, description } = req.body;
    
    // req.user.id가 아니라 req.user.userId를 사용
    const userId = req.user.userId;
    
    logDebug('신고 요청 받음', { 
        shopId, 
        reportType, 
        userId,
        user: req.user 
    });
    
    try {
        if (!reportType) {
            return res.status(400).json({ success: false, message: '신고 유형은 필수 항목입니다.' });
        }
        
        if (!userId || isNaN(userId)) {
            logError('유효하지 않은 사용자 ID', { userId, user: req.user });
            return res.status(400).json({ success: false, message: '유효한 사용자 ID가 없습니다.' });
        }
        
        const report = await ReportService.createShopReport(
            parseInt(shopId),
            parseInt(userId), // Number() 대신 parseInt()로 변경
            reportType,
            description
        );
        
        logInfo('신고 생성 완료', { reportId: report.id, userId });
        res.status(201).json({ success: true, data: report });
    } catch (error) {
        logError('샵 신고 생성 오류:', error);
        res.status(400).json({ success: false, message: error.message });
    }
});

// 댓글 신고하기
router.post('/comments/:commentId', authenticateToken, async (req, res) => {
    const { commentId } = req.params;
    const { reportType, description } = req.body;
    
    // req.user.id가 아니라 req.user.userId를 사용
    const userId = req.user.userId;
    
    logDebug('댓글 신고 요청 받음', { 
        commentId, 
        reportType, 
        userId 
    });
    
    try {
        if (!reportType) {
            return res.status(400).json({ success: false, message: '신고 유형은 필수 항목입니다.' });
        }
        
        if (!userId || isNaN(userId)) {
            logError('유효하지 않은 사용자 ID', { userId, user: req.user });
            return res.status(400).json({ success: false, message: '유효한 사용자 ID가 없습니다.' });
        }
        
        const report = await ReportService.createCommentReport(
            parseInt(commentId),
            parseInt(userId), // 명시적으로 정수로 변환
            reportType,
            description
        );
        
        logInfo('댓글 신고 생성 완료', { reportId: report.id, userId });
        res.status(201).json({ success: true, data: report });
    } catch (error) {
        logError('댓글 신고 생성 오류:', error);
        res.status(400).json({ success: false, message: error.message });
    }
});

// 자신이 제출한 신고 목록 조회
router.get('/me', authenticateToken, async (req, res) => {
    // req.user.id가 아니라 req.user.userId를 사용
    const userId = req.user.userId;
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    logDebug('사용자 신고 목록 조회 요청', { userId, page, limit });
    
    try {
        if (!userId || isNaN(userId)) {
            logError('유효하지 않은 사용자 ID', { userId, user: req.user });
            return res.status(400).json({ success: false, message: '유효한 사용자 ID가 없습니다.' });
        }
        
        const reports = await ReportService.getUserReports(userId, page, limit);
        logInfo('사용자 신고 목록 조회 완료', { count: reports.length, userId });
        res.status(200).json({ success: true, size: reports.length, data: reports });
    } catch (error) {
        logError('사용자 신고 목록 조회 오류:', error);
        res.status(400).json({ success: false, message: error.message });
    }
});

// 자신이 제출한 특정 신고 상세 조회
router.get('/me/:reportId', authenticateToken, async (req, res) => {
    const { reportId } = req.params;
    
    // req.user.id가 아니라 req.user.userId를 사용
    const userId = req.user.userId;
    
    logDebug('신고 상세 조회 요청', { reportId, userId });
    
    try {
        if (!userId || isNaN(userId)) {
            logError('유효하지 않은 사용자 ID', { userId, user: req.user });
            return res.status(400).json({ success: false, message: '유효한 사용자 ID가 없습니다.' });
        }
        
        const report = await ReportService.getReportById(parseInt(reportId), userId);
        logInfo('신고 상세 조회 완료', { reportId, userId });
        res.status(200).json({ success: true, data: report });
    } catch (error) {
        logError('신고 상세 조회 오류:', error);
        res.status(400).json({ success: false, message: error.message });
    }
});

export default router; 