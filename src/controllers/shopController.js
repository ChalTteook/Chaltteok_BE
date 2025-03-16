import express from 'express';
import ShopService from '../services/shopService.js';

const router = express.Router();

router.get('', async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Get page from query, default to 1
    const limit = parseInt(req.query.limit) || 20; // Get limit from query, default to 20
    const sort = req.query.sort || null; // 정렬 옵션: price(가격순), review(리뷰순), recommended(추천순)

    try {
        const shops = await ShopService.getShopList(page, limit, sort);
        res.status(200).json({ success: true, size: shops.length, data: shops });
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, message: error.message });
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const shop = await ShopService.getShop(id);
        res.status(200).json({ success: true, data: shop });
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, message: error.message });
    }
});

export default router;