import express from 'express';
import CommonService from '../services/commonService.js';

const router = express.Router();

router.post('/send/auth', async(req,res) => {
    const {body} = req;
    
    if(!body.phone_number) {
        return res.send({success : false , message : 'Request Error => phone_number'});
    }

    try {
        const result = await CommonService.sendAuthCode(body);
        res.status(200).json({ success: result.success, message: result.message});
    } catch(error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }

})

router.post('/check/auth', async(req,res) => {
    const {body} = req;
    
    if(!body.phone_number) {
        return res.send({success : false , message : 'Request Error => phone_number'});
    }

    if(!body.code) {
        return res.send({success : false , message : 'Request Error => code'});
    }

    try {
        const result = await CommonService.checkAuthCode(body);
        res.status(200).json({ success: result.success, message: result.message});
    } catch(error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }

})

router.post('/send/email', async(req,res) => {
    const {body} = req;
    
    if(!body.email) {
        return res.send({success : false , message : 'Request Error => email'});
    }

    try {
        const result = await CommonService.sendEmail(body);
        res.status(200).json({ success: result.success, message: result.message});
    } catch(error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }

})

export default router;