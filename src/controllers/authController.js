import express from 'express';
import LoginService from '../services/loginService.js';
import UserService from '../services/userService.js';
import UserModel from '../models/userModel.js';
import naverAuthService from '../services/naverAuthService.js';
import kakaoAuthService from '../services/kakaoAuthService.js';
import JwtUtil from '../utils/jwtUtil.js';

const router = express.Router();

router.post('/register', async (request, response) => {
    const userModel = new UserModel(request.body);
    try {
        await UserService.createUser(userModel);
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
    try {
        const { provider, code } = request.body;
        let userInfo;

        if (provider === 'naver') {
            const tokenResult = await naverAuthService.getAccessToken(code);
            if (tokenResult.success) {
                userInfo = await naverAuthService.getUserInfo(tokenResult.data.accessToken);
            }
        } else if (provider === 'kakao') {
            const tokenResult = await kakaoAuthService.getAccessToken(code);
            if (tokenResult.success) {
                userInfo = await kakaoAuthService.getUserInfo(tokenResult.data.accessToken);
            }
        }

        if (userInfo) {
            // social_id가 존재하는지 확인
            const existingUser = await UserService.findBySocialId(userInfo.data.id);
            if (existingUser) {
                // 이미 존재하는 사용자일 경우 JWT 토큰 생성
                const token = JwtUtil.generateToken({ userId: existingUser.id});
                response.status(200).json({ success: true, user: existingUser, token });
            } else {
                // 새로운 사용자 생성
                const newUser = new UserModel({
                    socialId: userInfo.data.id,
                    type: provider // 'kakao' 또는 'naver'로 설정
                });
                await UserService.createSocialUser(newUser);
                const token = JwtUtil.generateToken({ userId: newUser.id });
                response.status(201).json({ success: true, user: newUser, token });
            }
        } else {
            response.status(400).json({ success: false, message: '소셜 로그인 실패' });
        }
    } catch (error) {
        console.error(error);
        response.status(500).json({ success: false, message: '서버 오류' });
    }
});

export default router;