import express from 'express';
import PartnerShopService from '../services/partnerShopService.js';
import { authenticateToken, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// 모든 API에 인증 및 관리자 권한 검사 적용
router.use(authenticateToken);
router.use(isAdmin);

/**
 * @api {get} /api/v1/admin/partner-shops 제휴매장 목록 조회 (관리자)
 * @apiName GetPartnerShops
 * @apiGroup AdminPartnerShop
 * @apiDescription 관리자가 제휴매장 목록을 조회합니다.
 *
 * @apiParam {Number} [page=1] 페이지 번호
 * @apiParam {Number} [limit=20] 페이지당 항목 수
 * @apiParam {String} [status] 제휴 상태 필터 (active, expired, terminated)
 *
 * @apiSuccess {Boolean} success 성공 여부
 * @apiSuccess {Object[]} data 제휴매장 목록
 * @apiSuccess {Number} total 총 제휴매장 수
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status || null;

    const result = await PartnerShopService.getPartnerShops(page, limit, status);

    res.json({
      success: true,
      data: result.data,
      total: result.total,
      page,
      limit
    });
  } catch (error) {
    console.error('제휴매장 목록 조회 에러:', error);
    res.status(500).json({
      success: false,
      message: error.message || '제휴매장 목록을 조회하는 중에 오류가 발생했습니다.'
    });
  }
});

/**
 * @api {get} /api/v1/admin/partner-shops/:shopId 특정 제휴매장 조회 (관리자)
 * @apiName GetPartnerShopById
 * @apiGroup AdminPartnerShop
 * @apiDescription 관리자가 특정 제휴매장의 정보를 조회합니다.
 *
 * @apiParam {Number} shopId 매장 ID
 *
 * @apiSuccess {Boolean} success 성공 여부
 * @apiSuccess {Object} data 제휴매장 정보
 */
router.get('/:shopId', async (req, res) => {
  try {
    const shopId = parseInt(req.params.shopId);

    if (!shopId) {
      return res.status(400).json({
        success: false,
        message: '유효한 매장 ID가 필요합니다.'
      });
    }

    const partnerShop = await PartnerShopService.getPartnerShopById(shopId);

    res.json({
      success: true,
      data: partnerShop
    });
  } catch (error) {
    console.error('제휴매장 조회 에러:', error);
    
    if (error.message === '해당 제휴매장을 찾을 수 없습니다.') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: '제휴매장 정보를 조회하는 중에 오류가 발생했습니다.'
    });
  }
});

/**
 * @api {post} /api/v1/admin/partner-shops 제휴매장 등록 (관리자)
 * @apiName AddPartnerShop
 * @apiGroup AdminPartnerShop
 * @apiDescription 관리자가 새로운 제휴매장을 등록합니다.
 *
 * @apiParam {Number} shopId 매장 ID
 * @apiParam {String} partnerDate 제휴 시작일 (YYYY-MM-DD)
 * @apiParam {String} [expiryDate] 제휴 만료일 (YYYY-MM-DD)
 *
 * @apiSuccess {Boolean} success 성공 여부
 * @apiSuccess {Object} data 등록된 제휴매장 정보
 */
router.post('/', async (req, res) => {
  try {
    const { shopId, partnerDate, expiryDate } = req.body;

    if (!shopId || !partnerDate) {
      return res.status(400).json({
        success: false,
        message: '매장 ID와 제휴 시작일은 필수 항목입니다.'
      });
    }

    const newPartnerShop = await PartnerShopService.addPartnerShop(
      parseInt(shopId),
      partnerDate,
      expiryDate
    );

    res.status(201).json({
      success: true,
      data: newPartnerShop,
      message: '제휴매장이 성공적으로 등록되었습니다.'
    });
  } catch (error) {
    console.error('제휴매장 등록 에러:', error);
    
    if (error.message.includes('이미 제휴매장으로 등록') || 
        error.message.includes('존재하지 않습니다')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: '제휴매장을 등록하는 중에 오류가 발생했습니다.'
    });
  }
});

/**
 * @api {put} /api/v1/admin/partner-shops/:shopId 제휴매장 정보 수정 (관리자)
 * @apiName UpdatePartnerShop
 * @apiGroup AdminPartnerShop
 * @apiDescription 관리자가 제휴매장 정보를 수정합니다.
 *
 * @apiParam {Number} shopId 매장 ID
 * @apiParam {String} [partnerDate] 제휴 시작일 (YYYY-MM-DD)
 * @apiParam {String} [expiryDate] 제휴 만료일 (YYYY-MM-DD)
 * @apiParam {String} [status] 제휴 상태 (active, expired, terminated)
 *
 * @apiSuccess {Boolean} success 성공 여부
 * @apiSuccess {Object} data 수정된 제휴매장 정보
 */
router.put('/:shopId', async (req, res) => {
  try {
    const shopId = parseInt(req.params.shopId);
    const { partnerDate, expiryDate, status } = req.body;

    if (!shopId) {
      return res.status(400).json({
        success: false,
        message: '유효한 매장 ID가 필요합니다.'
      });
    }

    // 최소한 하나의 필드는 있어야 합니다
    if (!partnerDate && !expiryDate && !status) {
      return res.status(400).json({
        success: false,
        message: '수정할 정보가 필요합니다.'
      });
    }

    // status 값이 유효한지 확인
    if (status && !['active', 'expired', 'terminated'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: '유효한 상태 값이 아닙니다. (active, expired, terminated)'
      });
    }

    const updateData = {};
    if (partnerDate) updateData.partnerDate = partnerDate;
    if (expiryDate) updateData.expiryDate = expiryDate;
    if (status) updateData.status = status;

    const updatedPartnerShop = await PartnerShopService.updatePartnerShop(shopId, updateData);

    res.json({
      success: true,
      data: updatedPartnerShop,
      message: '제휴매장 정보가 성공적으로 수정되었습니다.'
    });
  } catch (error) {
    console.error('제휴매장 정보 수정 에러:', error);
    
    if (error.message === '해당 제휴매장을 찾을 수 없습니다.') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: '제휴매장 정보를 수정하는 중에 오류가 발생했습니다.'
    });
  }
});

/**
 * @api {delete} /api/v1/admin/partner-shops/:shopId 제휴매장 삭제 (관리자)
 * @apiName DeletePartnerShop
 * @apiGroup AdminPartnerShop
 * @apiDescription 관리자가 제휴매장을 삭제합니다.
 *
 * @apiParam {Number} shopId 매장 ID
 *
 * @apiSuccess {Boolean} success 성공 여부
 * @apiSuccess {String} message 결과 메시지
 */
router.delete('/:shopId', async (req, res) => {
  try {
    const shopId = parseInt(req.params.shopId);

    if (!shopId) {
      return res.status(400).json({
        success: false,
        message: '유효한 매장 ID가 필요합니다.'
      });
    }

    await PartnerShopService.deletePartnerShop(shopId);

    res.json({
      success: true,
      message: '제휴매장이 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    console.error('제휴매장 삭제 에러:', error);
    
    if (error.message === '해당 제휴매장을 찾을 수 없습니다.') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: '제휴매장을 삭제하는 중에 오류가 발생했습니다.'
    });
  }
});

export default router; 