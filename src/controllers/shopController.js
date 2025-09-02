import express from 'express';
import ShopService from '../services/shopService.js';

const router = express.Router();

/**
 * @api {get} /api/v1/shops 매장 목록 조회
 * @apiName GetShops
 * @apiGroup Shop
 * @apiDescription 매장 목록을 조회합니다. 제휴매장이 우선 표시됩니다.
 *
 * @apiParam {Number} [page=1] 페이지 번호
 * @apiParam {Number} [limit=20] 페이지당 항목 수
 * @apiParam {String} [sort] 정렬 기준 (price, review)
 * @apiParam {Boolean} [partner_only=false] 제휴매장만 조회 여부
 *
 * @apiSuccess {Boolean} success 성공 여부
 * @apiSuccess {Object[]} data 매장 목록
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const sort = req.query.sort || '';
    const partnerOnly = req.query.partner_only === 'true';

    const data = await ShopService.getShopList(page, limit, sort, partnerOnly);

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('매장 목록 조회 중 오류 발생:', error);
    res.status(500).json({
      success: false,
      message: '매장 목록을 조회하는 중에 오류가 발생했습니다.'
    });
  }
});

/**
 * @api {get} /api/v1/shops/:id 매장 상세 조회
 * @apiName GetShopById
 * @apiGroup Shop
 * @apiDescription 특정 매장의 상세 정보를 조회합니다. 제휴매장 정보도 포함됩니다.
 *
 * @apiParam {Number} id 매장 ID
 *
 * @apiSuccess {Boolean} success 성공 여부
 * @apiSuccess {Object} data 매장 정보
 */
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: '유효한 매장 ID가 필요합니다.'
      });
    }
    
    const shop = await ShopService.getShop(id);
    
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: '해당 매장을 찾을 수 없습니다.'
      });
    }
    
    res.json({
      success: true,
      data: shop
    });
  } catch (error) {
    console.error('매장 상세 조회 중 오류 발생:', error);
    res.status(500).json({
      success: false,
      message: '매장 정보를 조회하는 중에 오류가 발생했습니다.'
    });
  }
});

export default router;