import express from 'express';
import ShopService from '../services/shopService.js';

const router = express.Router();

router.get('', async (req, res) => {
    try {
        const shops = await ShopService.getShopList(0, 20);
        res.status(200).json({ success: true, data: shops });
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