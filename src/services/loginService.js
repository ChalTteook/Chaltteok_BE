import UserService from './userService.js';
import JwtUtil from '../utils/jwtUtil.js';
import naverAuthService from './naverAuthService.js';
import kakaoAuthService from './kakaoAuthService.js';
import UserModel from '../models/userModel.js';
import SessionRepository from '../dataaccess/repositories/sessionRepository.js';

class LoginService {
    constructor() {
        this.userService = new UserService();
        this.sessionRepository = new SessionRepository();
    }

    async login(email, password) {
        const user = await this.userService.findByEmail(email);

        if (user && await user.verifyPassword(password)) {
            // const session = await SessionRepository.findSession(user.id);
            let token
            /* 세션 바로바로 교체하는거로 변경*/
            token = JwtUtil.generateToken({ userId: user.id });
            this.sessionRepository.saveSession(user.id, token);

            // if (session) {
            //     token = session.session;
            // } else {
            //     token = JwtUtil.generateToken({ userId: user.id });
            //     SessionRepository.saveSession(user.id, token);
            // }
            
            return { user, token };
        }
        return null;
    }

    async socailLoginGetAuthCode() {
        const data = await kakaoAuthService.getAuthCode();
        return data;
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
            const existingUser = await this.userService.findBySocialId(userInfo.data.id);
            if (existingUser) {
                // const token = JwtUtil.generateToken({ userId: existingUser.id });
                const session = await this.sessionRepository.findSession(existingUser.id);
                let token

                if (session) {
                    token = session.session;
                } else {
                    token = JwtUtil.generateToken({ userId: existingUser.id });
                    this.sessionRepository.saveSession(existingUser.id, token);
                }
                return { user: existingUser, token };
            } else {
                const newUser = new UserModel({
                    socialId: userInfo.data.id,
                    type: provider // 'kakao' 또는 'naver'로 설정
                });

                await this.userService.createSocialUser(newUser);
                const token = JwtUtil.generateToken({ userId: newUser.id });
                this.sessionRepository.saveUserSession(newUser.id, token);

                return { user: newUser, token };
            }
        } else {
            throw new Error('Social login failed');
        }
    }
}

export default new LoginService();