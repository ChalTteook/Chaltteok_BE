import { jest } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import LoginService from '../src/services/loginService.js';
import UserService from '../src/services/userService.js';
import authRouter from '../src/controllers/authController.js';

// 서비스 모킹
jest.mock('../src/services/loginService.js');
jest.mock('../src/services/userService.js');

describe('AuthController', () => {
    let app;

    // 테스트 앱 설정
    beforeAll(() => {
        app = express();
        app.use(express.json());
        app.use('/api/v1/auth', authRouter);
    });

    // 각 테스트 전에 실행
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/v1/auth/social-login', () => {
        it('성공적으로 소셜 로그인하는 경우', async () => {
            // Mock 응답 설정
            const mockUser = {
                id: 'user_id',
                email: 'user@example.com',
                name: '테스트 사용자'
            };
            const mockResult = {
                user: mockUser,
                token: 'test_token'
            };
            LoginService.socialLogin.mockResolvedValue(mockResult);

            // 테스트 요청
            const response = await request(app)
                .post('/api/v1/auth/social-login')
                .send({ provider: 'kakao', code: 'test_auth_code' });

            // 검증
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.user).toEqual(mockUser);
            expect(response.body.token).toBe('test_token');
            expect(LoginService.socialLogin).toHaveBeenCalledWith('kakao', 'test_auth_code');
        });

        it('provider 또는 code가 누락된 경우', async () => {
            // 누락된 provider로 테스트
            const response1 = await request(app)
                .post('/api/v1/auth/social-login')
                .send({ code: 'test_auth_code' });

            // 검증
            expect(response1.status).toBe(400);
            expect(response1.body.success).toBe(false);
            expect(response1.body.message).toContain('Provider와 코드가 필요합니다');

            // 누락된 code로 테스트
            const response2 = await request(app)
                .post('/api/v1/auth/social-login')
                .send({ provider: 'kakao' });

            // 검증
            expect(response2.status).toBe(400);
            expect(response2.body.success).toBe(false);
            expect(response2.body.message).toContain('Provider와 코드가 필요합니다');
        });

        it('소셜 로그인 실패하는 경우', async () => {
            // Mock 에러 설정
            LoginService.socialLogin.mockRejectedValue(new Error('소셜 로그인 처리 중 오류가 발생했습니다'));

            // 테스트 요청
            const response = await request(app)
                .post('/api/v1/auth/social-login')
                .send({ provider: 'kakao', code: 'invalid_code' });

            // 검증
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('소셜 로그인 처리 중 오류가 발생했습니다');
            expect(LoginService.socialLogin).toHaveBeenCalledWith('kakao', 'invalid_code');
        });
    });

    describe('GET /api/v1/auth/kakao_auth', () => {
        it('카카오 인증 URL을 성공적으로 가져오는 경우', async () => {
            // Mock 응답 설정
            const mockResponse = {
                request: {
                    res: {
                        responseUrl: 'https://kauth.kakao.com/oauth/authorize?mockurl'
                    }
                }
            };
            LoginService.socialLoginGetAuthCode.mockResolvedValue(mockResponse);

            // 테스트 요청
            const response = await request(app)
                .get('/api/v1/auth/kakao_auth');

            // 검증
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toBe('https://kauth.kakao.com/oauth/authorize?mockurl');
            expect(LoginService.socialLoginGetAuthCode).toHaveBeenCalled();
        });

        it('카카오 인증 URL 가져오기 실패하는 경우', async () => {
            // Mock 에러 설정
            LoginService.socialLoginGetAuthCode.mockRejectedValue(new Error('카카오 인증 URL을 가져오는 중 오류가 발생했습니다'));

            // 테스트 요청
            const response = await request(app)
                .get('/api/v1/auth/kakao_auth');

            // 검증
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('카카오 인증 URL을 가져오는 중 오류가 발생했습니다');
            expect(LoginService.socialLoginGetAuthCode).toHaveBeenCalled();
        });
    });
}); 