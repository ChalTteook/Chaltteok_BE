import express from 'express';
import StudioService from '../services/studioService.js';

const router = express.Router();
const studioService = new StudioService();

router.get('', async (req, res) => {
    try {
        const studios = await studioService.getStudioList(0, 20);
        res.status(200).json({ success: true, data: studios });
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, message: error.message });
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const studio = await studioService.getStudio(id);
        res.status(200).json({ success: true, data: studio });
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, message: error.message });
    }
});

export default router;