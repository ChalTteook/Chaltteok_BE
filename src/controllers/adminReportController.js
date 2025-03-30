import express from 'express';
import AdminReportService from '../services/adminReportService.js';
import { authenticateToken, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// 모든 미들웨어에 관리자 권한 체크 적용
router.use(authenticateToken, isAdmin);

// 전체 신고 목록 조회
router.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status || null;
    const targetType = req.query.target_type || null;
    
    try {
        const reports = await AdminReportService.getAllReports(status, targetType, page, limit);
        res.status(200).json({ success: true, size: reports.length, data: reports });
    } catch (error) {
        console.error('전체 신고 목록 조회 오류:', error);
        res.status(400).json({ success: false, message: error.message });
    }
});

// 특정 신고 상세 조회
router.get('/:reportId', async (req, res) => {
    const { reportId } = req.params;
    
    try {
        const report = await AdminReportService.getReportById(parseInt(reportId));
        res.status(200).json({ success: true, data: report });
    } catch (error) {
        console.error('신고 상세 조회 오류:', error);
        res.status(400).json({ success: false, message: error.message });
    }
});

// 신고 상태 업데이트
router.put('/:reportId/status', async (req, res) => {
    const { reportId } = req.params;
    const { status, adminComment } = req.body;
    const adminId = req.user.id;
    
    try {
        if (!status) {
            return res.status(400).json({ success: false, message: '상태 값은 필수 항목입니다.' });
        }
        
        const report = await AdminReportService.updateReportStatus(
            parseInt(reportId),
            status,
            adminComment,
            adminId
        );
        
        res.status(200).json({ success: true, data: report });
    } catch (error) {
        console.error('신고 상태 업데이트 오류:', error);
        res.status(400).json({ success: false, message: error.message });
    }
});

// 특정 샵에 대한 신고 목록 조회
router.get('/shops/:shopId', async (req, res) => {
    const { shopId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    try {
        const reports = await AdminReportService.getReportsByTarget('shop', parseInt(shopId), page, limit);
        res.status(200).json({ success: true, size: reports.length, data: reports });
    } catch (error) {
        console.error('샵 신고 목록 조회 오류:', error);
        res.status(400).json({ success: false, message: error.message });
    }
});

// 특정 댓글에 대한 신고 목록 조회
router.get('/comments/:commentId', async (req, res) => {
    const { commentId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    try {
        const reports = await AdminReportService.getReportsByTarget('comment', parseInt(commentId), page, limit);
        res.status(200).json({ success: true, size: reports.length, data: reports });
    } catch (error) {
        console.error('댓글 신고 목록 조회 오류:', error);
        res.status(400).json({ success: false, message: error.message });
    }
});

// 신고 통계 정보 조회
router.get('/stats', async (req, res) => {
    try {
        const stats = await AdminReportService.getReportStats();
        res.status(200).json({ success: true, data: stats });
    } catch (error) {
        console.error('신고 통계 조회 오류:', error);
        res.status(400).json({ success: false, message: error.message });
    }
});

export default router; 