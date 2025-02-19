import express from 'express';
import LoginService from '../services/loginService.js';
import UserService from '../services/userService.js';
import UserModel from '../models/userModel.js';

const router = express.Router();
const userService = new UserService();

router.post('/register', async (request, response) => {
    const userModel = new UserModel(request.body);
    try {
        await userService.createUser(userModel);
        response.status(201).json({ success: true, message: '회원가입 성공' });
    } catch (error) {
        console.error(error);
        response.status(400).json({ success: false, message: error.message });
    }
});

router.post('/login', async (request, response) => {
    const { email, password } = request.body;
    try {
        const result = await LoginService.login(email, password);
        if (result) {
            response.status(200).json({ success: true, ...result });
        } else {
            response.status(401).json({ success: false, message: '이메일 또는 비밀번호가 잘못되었습니다.' });
        }
    } catch (error) {
        console.error(error);
        response.status(500).json({ success: false, message: '서버 오류' });
    }
});

router.post('/social-login', async (request, response) => {
    const { provider, code } = request.body;
    try {
        const result = await LoginService.socialLogin(provider, code);
        response.status(200).json({ success: true, ...result });
    } catch (error) {
        console.error(error);
        response.status(400).json({ success: false, message: error.message });
    }
});

router.get('/kakao_auth', async(request,response) => {
    try {
        const result = await LoginService.socailLoginGetAuthCode();
        response.status(200).json({ success: true, data : result.request.res.responseUrl });
    } catch(error) {
        console.error(error);
        response.status(400).json({ success: false, message: error.message });
    }
})

export default router;