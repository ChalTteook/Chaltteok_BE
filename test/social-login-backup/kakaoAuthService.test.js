import { jest } from '@jest/globals';
import axios from 'axios';
import kakaoAuthService from '../src/services/kakaoAuthService.js';

describe('KakaoAuthService', () => {
    // 각 테스트 전에 실행
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(axios, 'get').mockReset();
    });

    describe('getAuthCode', () => {
        it('성공적으로 인증 URL을 가져오는 경우', async () => {
            // Mock 응답 설정
            const mockResponse = {
                request: {
                    res: {
                        responseUrl: 'https://kauth.kakao.com/oauth/authorize?mockurl'
                    }
                }
            };
            
            jest.spyOn(axios, 'get').mockImplementation(() => Promise.resolve(mockResponse));

            // 테스트 실행
            const result = await kakaoAuthService.getAuthCode();

            // 검증
            expect(result).toBeDefined();
            expect(result.request.res.responseUrl).toBe('https://kauth.kakao.com/oauth/authorize?mockurl');
            expect(axios.get).toHaveBeenCalledWith(
                'https://kauth.kakao.com/oauth/authorize',
                expect.any(Object)
            );
        });

        it('인증 URL 가져오기 실패하는 경우', async () => {
            // Mock 에러 설정
            jest.spyOn(axios, 'get').mockImplementation(() => Promise.reject(new Error('Network error')));

            // 테스트 실행 및 에러 기대
            await expect(kakaoAuthService.getAuthCode()).rejects.toThrow('카카오 인증 URL을 가져오는데 실패했습니다');
        });

        it('응답이 유효하지 않은 경우', async () => {
            // 유효하지 않은 응답 설정
            const invalidResponse = {
                // request나 responseUrl이 없는 경우
                request: {}
            };
            
            jest.spyOn(axios, 'get').mockImplementation(() => Promise.resolve(invalidResponse));

            // 테스트 실행 및 에러 기대
            await expect(kakaoAuthService.getAuthCode()).rejects.toThrow('Invalid response from Kakao authorization server');
        });
    });

    describe('getAccessToken', () => {
        it('성공적으로 액세스 토큰을 가져오는 경우', async () => {
            // Mock 응답 설정
            const mockResponse = {
                data: {
                    access_token: 'mock_access_token',
                    refresh_token: 'mock_refresh_token',
                    expires_in: 3600
                }
            };
            
            jest.spyOn(axios, 'get').mockImplementation(() => Promise.resolve(mockResponse));

            // 테스트 실행
            const result = await kakaoAuthService.getAccessToken('test_auth_code');

            // 검증
            expect(result.success).toBe(true);
            expect(result.data).toEqual({
                accessToken: 'mock_access_token',
                refreshToken: 'mock_refresh_token',
                expiresIn: 3600
            });
            expect(axios.get).toHaveBeenCalledWith(
                'https://kauth.kakao.com/oauth/token',
                expect.any(Object)
            );
        });

        it('액세스 토큰 가져오기 실패하는 경우', async () => {
            // Mock 에러 설정
            jest.spyOn(axios, 'get').mockImplementation(() => Promise.reject(new Error('Network error')));

            // 테스트 실행
            const result = await kakaoAuthService.getAccessToken('test_auth_code');

            // 검증
            expect(result.success).toBe(false);
            expect(result.error).toBe('Failed to get Kakao access token');
            expect(result.details).toBe('Network error');
        });
    });

    describe('getUserInfo', () => {
        it('성공적으로 사용자 정보를 가져오는 경우', async () => {
            // Mock 응답 설정
            const mockResponse = {
                data: {
                    id: 'test_kakao_id',
                    kakao_account: {
                        email: 'test@kakao.com',
                        profile: {
                            nickname: 'KakaoUser',
                            profile_image_url: 'http://example.com/kakao_profile.jpg'
                        }
                    }
                }
            };
            
            jest.spyOn(axios, 'get').mockImplementation(() => Promise.resolve(mockResponse));

            // 테스트 실행
            const result = await kakaoAuthService.getUserInfo('test_access_token');

            // 검증
            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockResponse.data);
            expect(axios.get).toHaveBeenCalledWith(
                'https://kapi.kakao.com/v2/user/me',
                {
                    headers: {
                        'Authorization': 'Bearer test_access_token'
                    }
                }
            );
        });

        it('사용자 정보 가져오기 실패하는 경우', async () => {
            // Mock 에러 설정
            jest.spyOn(axios, 'get').mockImplementation(() => Promise.reject(new Error('API error')));

            // 테스트 실행
            const result = await kakaoAuthService.getUserInfo('test_access_token');

            // 검증
            expect(result.success).toBe(false);
            expect(result.error).toBe('Failed to get Kakao user info');
            expect(result.details).toBe('API error');
        });
    });
}); 