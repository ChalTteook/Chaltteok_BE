import UserService from './userService.js';
import JwtUtil from '../utils/jwtUtil.js';
import naverAuthService from './naverAuthService.js';
import kakaoAuthService from './kakaoAuthService.js';
import UserModel from '../models/userModel.js';
import SessionRepository from '../dataaccess/repositories/sessionRepository.js';

class LoginService {
    constructor() {
        this.userService = UserService;
        this.sessionRepository = SessionRepository;
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

    async socialLoginGetAuthCode() {
        try {
            const data = await kakaoAuthService.getAuthCode();
            if (!data) {
                throw new Error('Failed to get Kakao authorization code');
            }
            return data;
        } catch(error) {
            console.error('Error getting authorization code:', error);
            throw error;
        }
    }

    async socialLogin(provider, code) {
        let userInfo;
        let tokenResult;

        try {
            if (provider === 'naver') {
                tokenResult = await naverAuthService.getAccessToken(code);
                if (!tokenResult.success) {
                    throw new Error(tokenResult.error || 'Failed to get Naver access token');
                }
                userInfo = await naverAuthService.getUserInfo(tokenResult.data.accessToken);
                if (!userInfo.success) {
                    throw new Error(userInfo.error || 'Failed to get Naver user info');
                }
            } else if (provider === 'kakao') {
                tokenResult = await kakaoAuthService.getAccessToken(code);
                if (!tokenResult.success) {
                    throw new Error(tokenResult.error || 'Failed to get Kakao access token');
                }
                userInfo = await kakaoAuthService.getUserInfo(tokenResult.data.accessToken);
                if (!userInfo.success) {
                    throw new Error(userInfo.error || 'Failed to get Kakao user info');
                }
            } else {
                throw new Error(`Unsupported provider: ${provider}`);
            }

            if (userInfo && userInfo.success) {
                const existingUser = await this.userService.findBySocialId(userInfo.data.id);
                let token;
                
                if (existingUser) {
                    const session = await this.sessionRepository.findSession(existingUser.id);
                    
                    if (session) {
                        token = session.session;
                    } else {
                        token = JwtUtil.generateToken({ userId: existingUser.id });
                        await this.sessionRepository.saveSession(existingUser.id, token);
                    }
                    return { user: existingUser, token };
                } else {
                    const newUser = new UserModel({
                        socialId: userInfo.data.id,
                        type: provider // 'kakao' 또는 'naver'로 설정
                    });

                    const createdUser = await this.userService.createSocialUser(newUser);
                    if (!createdUser) {
                        throw new Error('Failed to create user account');
                    }
                    
                    token = JwtUtil.generateToken({ userId: newUser.id });
                    await this.sessionRepository.saveSession(newUser.id, token);

                    return { user: newUser, token };
                }
            } else {
                throw new Error('Social login failed: User information not available');
            }
        } catch (error) {
            console.error('Social login error:', error);
            throw error;
        }
    }
}

export default new LoginService();