import { jest } from '@jest/globals';
import axios from 'axios';
import readlineSync from 'readline-sync';
import naverAuthService from '../src/services/naverAuthService.js';

// axios 모킹
jest.mock('axios', () => ({
    get: jest.fn()
}));

// readline-sync 모킹
jest.mock('readline-sync', () => ({
    question: jest.fn()
}));

describe('NaverAuthService', () => {
    // 각 테스트 전에 실행
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAccessToken', () => {
        it('성공적으로 액세스 토큰을 가져오는 경우', async () => {
            // 사용자 입력 Mock 설정
            const mockAuthCode = readlineSync.question('네이버 인증 코드를 입력하세요: ');
            console.log('입력받은 인증 코드:', mockAuthCode);
            
            // Mock 응답 설정
            const mockResponse = {
                data: {
                    access_token: 'mock_access_token',
                    refresh_token: 'mock_refresh_token',
                    expires_in: 3600
                }
            };
            axios.get.mockResolvedValue(mockResponse);

            // 테스트 실행
            const result = await naverAuthService.getAccessToken(mockAuthCode);
            console.log('getAccessToken 응답 결과:', result);

            // 검증
            expect(result.success).toBe(true);
            expect(result.data).toEqual({
                accessToken: 'mock_access_token',
                refreshToken: 'mock_refresh_token',
                expiresIn: 3600
            });
            expect(axios.get).toHaveBeenCalledWith(
                'https://nid.naver.com/oauth2.0/token',
                expect.any(Object)
            );
        });

        it('액세스 토큰 가져오기 실패하는 경우', async () => {
            // 사용자 입력 받기
            const mockAuthCode = readlineSync.question('네이버 인증 코드를 입력하세요: ');
            console.log('입력받은 인증 코드:', mockAuthCode);

            // Mock 에러 설정
            axios.get.mockRejectedValue(new Error('Network error'));

            // 테스트 실행
            const result = await naverAuthService.getAccessToken(mockAuthCode);
            console.log('getAccessToken 에러 결과:', result);

            // 검증
            expect(result.success).toBe(false);
            expect(result.error).toBe('Failed to get Naver access token');
            expect(result.details).toBe('Network error');
        });
    });

    describe('getUserInfo', () => {
        it('성공적으로 사용자 정보를 가져오는 경우', async () => {
            // Mock 응답 설정
            const mockResponse = {
                data: {
                    response: {
                        id: 'test_id',
                        email: 'test@example.com',
                        nickname: 'TestUser',
                        profile_image: 'http://example.com/profile.jpg'
                    }
                }
            };
            axios.get.mockResolvedValue(mockResponse);

            // 테스트 실행
            const result = await naverAuthService.getUserInfo('test_access_token');

            // 검증
            expect(result.success).toBe(true);
            expect(result.data).toEqual({
                id: 'test_id',
                email: 'test@example.com',
                nickname: 'TestUser',
                profileImage: 'http://example.com/profile.jpg',
                provider: 'naver'
            });
            expect(axios.get).toHaveBeenCalledWith(
                'https://openapi.naver.com/v1/nid/me',
                {
                    headers: {
                        'Authorization': 'Bearer test_access_token'
                    }
                }
            );
        });

        it('사용자 정보 가져오기 실패하는 경우', async () => {
            // Mock 에러 설정
            axios.get.mockRejectedValue(new Error('API error'));

            // 테스트 실행
            const result = await naverAuthService.getUserInfo('test_access_token');

            // 검증
            expect(result.success).toBe(false);
            expect(result.error).toBe('Failed to get Naver user info');
            expect(result.details).toBe('API error');
        });
    });
});