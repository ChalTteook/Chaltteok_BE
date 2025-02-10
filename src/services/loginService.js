import UserService from './userService.js';
import JwtUtil from '../utils/jwtUtil.js';
import naverAuthService from './naverAuthService.js';
import kakaoAuthService from './kakaoAuthService.js';
import UserModel from '../models/userModel.js';

class LoginService {
    async login(email, password) {
        const user = await UserService.findByEmail(email);
        if (user && await user.verifyPassword(password)) {
            const token = JwtUtil.generateToken({ userId: user.id });
            return { user, token };
        }
        return null;
    }

    async socialLogin(provider, code) {
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
            const existingUser = await UserService.findBySocialId(userInfo.data.id);
            if (existingUser) {
                const token = JwtUtil.generateToken({ userId: existingUser.id });
                return { user: existingUser, token };
            } else {
                const newUser = new UserModel({
                    socialId: userInfo.data.id,
                    type: provider // 'kakao' 또는 'naver'로 설정
                });
                await UserService.createSocialUser(newUser);
                const token = JwtUtil.generateToken({ userId: newUser.id });
                return { user: newUser, token };
            }
        } else {
            throw new Error('Social login failed');
        }
    }
}

export default new LoginService();