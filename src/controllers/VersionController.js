import express from 'express';
import versionService from '../services/versionService.js';

const router = express.Router();

const getVersionCheck = async (req, res) => {
    try {
        const data = await versionService.getVersion();
        res.status(200).json({ success: true, ...data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

router.get('/check', getVersionCheck);

export default router;
