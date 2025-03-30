import express from 'express';
import LoginService from '../services/loginService.js';
import UserService from '../services/userService.js';
import UserModel from '../models/userModel.js';

const router = express.Router();
const userService = UserService;

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
            console.log('로그인 성공, 토큰 반환:', result.token ? '토큰 있음' : '토큰 없음');
            response.status(200).json({ 
                success: true, 
                user: result.user,
                token: result.token
            });
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
    
    if (!provider || !code) {
        return response.status(400).json({ 
            success: false, 
            message: 'Provider와 코드가 필요합니다.' 
        });
    }
    
    try {
        const result = await LoginService.socialLogin(provider, code);
        response.status(200).json({ success: true, ...result });
    } catch (error) {
        console.error('Social login error:', error);
        response.status(400).json({ 
            success: false, 
            message: error.message || '소셜 로그인 처리 중 오류가 발생했습니다.' 
        });
    }
});

router.get('/kakao_auth', async(request, response) => {
    try {
        const result = await LoginService.socialLoginGetAuthCode();
        response.status(200).json({ success: true, data: result.request.res.responseUrl });
    } catch(error) {
        console.error('Kakao auth error:', error);
        response.status(400).json({ 
            success: false, 
            message: error.message || '카카오 인증 URL을 가져오는 중 오류가 발생했습니다.' 
        });
    }
});

export default router;