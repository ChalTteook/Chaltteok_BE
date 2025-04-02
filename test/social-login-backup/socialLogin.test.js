import { jest } from '@jest/globals';
import LoginService from '../src/services/loginService.js';
import kakaoAuthService from '../src/services/kakaoAuthService.js';
import naverAuthService from '../src/services/naverAuthService.js';
import UserService from '../src/services/userService.js';
import SessionRepository from '../src/dataaccess/repositories/sessionRepository.js';
import JwtUtil from '../src/utils/jwtUtil.js';

// 서비스 모킹
jest.mock('../src/services/kakaoAuthService.js');
jest.mock('../src/services/naverAuthService.js');
jest.mock('../src/services/userService.js');
jest.mock('../src/dataaccess/repositories/sessionRepository.js');
jest.mock('../src/utils/jwtUtil.js');

describe('LoginService - 소셜 로그인 기능', () => {
    // 각 테스트 전에 실행
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('socialLoginGetAuthCode', () => {
        it('카카오 인증 코드를 성공적으로 가져오는 경우', async () => {
            // Mock 응답 설정
            const mockAuthCodeResponse = {
                request: {
                    res: {
                        responseUrl: 'https://kauth.kakao.com/oauth/authorize?mockurl'
                    }
                }
            };
            kakaoAuthService.getAuthCode.mockResolvedValue(mockAuthCodeResponse);

            // 테스트 실행
            const result = await LoginService.socialLoginGetAuthCode();

            // 검증
            expect(result).toEqual(mockAuthCodeResponse);
            expect(kakaoAuthService.getAuthCode).toHaveBeenCalled();
        });

        it('카카오 인증 코드 가져오기 실패하는 경우', async () => {
            // Mock 에러 설정
            kakaoAuthService.getAuthCode.mockRejectedValue(new Error('인증 URL 가져오기 실패'));

            // 테스트 실행 및 에러 기대
            await expect(LoginService.socialLoginGetAuthCode()).rejects.toThrow('인증 URL 가져오기 실패');
        });

        it('null 응답 처리하는 경우', async () => {
            // null 응답 설정
            kakaoAuthService.getAuthCode.mockResolvedValue(null);

            // 테스트 실행 및 에러 기대
            await expect(LoginService.socialLoginGetAuthCode()).rejects.toThrow('Failed to get Kakao authorization code');
        });
    });

    describe('socialLogin - 카카오', () => {
        it('새 사용자가 카카오로 로그인 성공하는 경우', async () => {
            // Mock 응답 설정
            const mockTokenResult = {
                success: true,
                data: {
                    accessToken: 'kakao_test_token'
                }
            };
            const mockUserInfo = {
                success: true,
                data: {
                    id: 'kakao_user_id',
                    kakao_account: {
                        email: 'test@kakao.com'
                    }
                }
            };
            
            // Mock 설정
            kakaoAuthService.getAccessToken.mockResolvedValue(mockTokenResult);
            kakaoAuthService.getUserInfo.mockResolvedValue(mockUserInfo);
            UserService.findBySocialId.mockResolvedValue(null); // 기존 사용자 없음
            UserService.createSocialUser.mockResolvedValue({ id: 'new_user_id' });
            JwtUtil.generateToken.mockReturnValue('new_jwt_token');
            SessionRepository.saveSession.mockResolvedValue({ success: true });

            // 테스트 실행
            const result = await LoginService.socialLogin('kakao', 'test_code');

            // 검증
            expect(result).toBeDefined();
            expect(result.user).toBeDefined();
            expect(result.token).toBe('new_jwt_token');
            expect(kakaoAuthService.getAccessToken).toHaveBeenCalledWith('test_code');
            expect(kakaoAuthService.getUserInfo).toHaveBeenCalledWith('kakao_test_token');
            expect(UserService.findBySocialId).toHaveBeenCalledWith('kakao_user_id');
            expect(UserService.createSocialUser).toHaveBeenCalled();
            expect(JwtUtil.generateToken).toHaveBeenCalled();
            expect(SessionRepository.saveSession).toHaveBeenCalled();
        });

        it('기존 사용자가 카카오로 로그인 성공하는 경우', async () => {
            // Mock 응답 설정
            const mockTokenResult = {
                success: true,
                data: {
                    accessToken: 'kakao_test_token'
                }
            };
            const mockUserInfo = {
                success: true,
                data: {
                    id: 'kakao_user_id',
                    kakao_account: {
                        email: 'test@kakao.com'
                    }
                }
            };
            const existingUser = {
                id: 'existing_user_id',
                email: 'test@kakao.com',
                socialId: 'kakao_user_id'
            };
            
            // Mock 설정
            kakaoAuthService.getAccessToken.mockResolvedValue(mockTokenResult);
            kakaoAuthService.getUserInfo.mockResolvedValue(mockUserInfo);
            UserService.findBySocialId.mockResolvedValue(existingUser); // 기존 사용자 있음
            SessionRepository.findSession.mockResolvedValue(null); // 세션 없음
            JwtUtil.generateToken.mockReturnValue('existing_user_token');
            SessionRepository.saveSession.mockResolvedValue({ success: true });

            // 테스트 실행
            const result = await LoginService.socialLogin('kakao', 'test_code');

            // 검증
            expect(result).toBeDefined();
            expect(result.user).toEqual(existingUser);
            expect(result.token).toBe('existing_user_token');
            expect(kakaoAuthService.getAccessToken).toHaveBeenCalledWith('test_code');
            expect(kakaoAuthService.getUserInfo).toHaveBeenCalledWith('kakao_test_token');
            expect(UserService.findBySocialId).toHaveBeenCalledWith('kakao_user_id');
            expect(UserService.createSocialUser).not.toHaveBeenCalled();
            expect(JwtUtil.generateToken).toHaveBeenCalledWith({ userId: 'existing_user_id' });
            expect(SessionRepository.saveSession).toHaveBeenCalledWith('existing_user_id', 'existing_user_token');
        });

        it('기존 세션이 있는 사용자가 카카오로 로그인하는 경우', async () => {
            // Mock 응답 설정
            const mockTokenResult = {
                success: true,
                data: {
                    accessToken: 'kakao_test_token'
                }
            };
            const mockUserInfo = {
                success: true,
                data: {
                    id: 'kakao_user_id',
                    kakao_account: {
                        email: 'test@kakao.com'
                    }
                }
            };
            const existingUser = {
                id: 'existing_user_id',
                email: 'test@kakao.com',
                socialId: 'kakao_user_id'
            };
            const existingSession = {
                session: 'existing_session_token'
            };
            
            // Mock 설정
            kakaoAuthService.getAccessToken.mockResolvedValue(mockTokenResult);
            kakaoAuthService.getUserInfo.mockResolvedValue(mockUserInfo);
            UserService.findBySocialId.mockResolvedValue(existingUser); // 기존 사용자 있음
            SessionRepository.findSession.mockResolvedValue(existingSession); // 기존 세션 있음

            // 테스트 실행
            const result = await LoginService.socialLogin('kakao', 'test_code');

            // 검증
            expect(result).toBeDefined();
            expect(result.user).toEqual(existingUser);
            expect(result.token).toBe('existing_session_token');
            expect(kakaoAuthService.getAccessToken).toHaveBeenCalledWith('test_code');
            expect(kakaoAuthService.getUserInfo).toHaveBeenCalledWith('kakao_test_token');
            expect(UserService.findBySocialId).toHaveBeenCalledWith('kakao_user_id');
            expect(JwtUtil.generateToken).not.toHaveBeenCalled();
            expect(SessionRepository.saveSession).not.toHaveBeenCalled();
        });
    });

    describe('socialLogin - 네이버', () => {
        it('새 사용자가 네이버로 로그인 성공하는 경우', async () => {
            // Mock 응답 설정
            const mockTokenResult = {
                success: true,
                data: {
                    accessToken: 'naver_test_token'
                }
            };
            const mockUserInfo = {
                success: true,
                data: {
                    id: 'naver_user_id',
                    email: 'test@naver.com'
                }
            };
            
            // Mock 설정
            naverAuthService.getAccessToken.mockResolvedValue(mockTokenResult);
            naverAuthService.getUserInfo.mockResolvedValue(mockUserInfo);
            UserService.findBySocialId.mockResolvedValue(null); // 기존 사용자 없음
            UserService.createSocialUser.mockResolvedValue({ id: 'new_naver_user_id' });
            JwtUtil.generateToken.mockReturnValue('new_naver_jwt_token');
            SessionRepository.saveSession.mockResolvedValue({ success: true });

            // 테스트 실행
            const result = await LoginService.socialLogin('naver', 'test_code');

            // 검증
            expect(result).toBeDefined();
            expect(result.user).toBeDefined();
            expect(result.token).toBe('new_naver_jwt_token');
            expect(naverAuthService.getAccessToken).toHaveBeenCalledWith('test_code');
            expect(naverAuthService.getUserInfo).toHaveBeenCalledWith('naver_test_token');
            expect(UserService.findBySocialId).toHaveBeenCalledWith('naver_user_id');
            expect(UserService.createSocialUser).toHaveBeenCalled();
            expect(JwtUtil.generateToken).toHaveBeenCalled();
            expect(SessionRepository.saveSession).toHaveBeenCalled();
        });
    });

    describe('socialLogin - 에러 처리', () => {
        it('지원하지 않는 provider가 제공된 경우', async () => {
            // 테스트 실행 및 에러 기대
            await expect(LoginService.socialLogin('unknown', 'test_code')).rejects.toThrow('Unsupported provider: unknown');
        });

        it('액세스 토큰 가져오기 실패하는 경우', async () => {
            // Mock 설정
            kakaoAuthService.getAccessToken.mockResolvedValue({
                success: false,
                error: 'Failed to get Kakao access token'
            });

            // 테스트 실행 및 에러 기대
            await expect(LoginService.socialLogin('kakao', 'test_code')).rejects.toThrow('Failed to get Kakao access token');
        });

        it('사용자 정보 가져오기 실패하는 경우', async () => {
            // Mock 설정
            kakaoAuthService.getAccessToken.mockResolvedValue({
                success: true,
                data: {
                    accessToken: 'kakao_test_token'
                }
            });
            kakaoAuthService.getUserInfo.mockResolvedValue({
                success: false,
                error: 'Failed to get Kakao user info'
            });

            // 테스트 실행 및 에러 기대
            await expect(LoginService.socialLogin('kakao', 'test_code')).rejects.toThrow('Failed to get Kakao user info');
        });

        it('사용자 생성 실패하는 경우', async () => {
            // Mock 설정
            kakaoAuthService.getAccessToken.mockResolvedValue({
                success: true,
                data: {
                    accessToken: 'kakao_test_token'
                }
            });
            kakaoAuthService.getUserInfo.mockResolvedValue({
                success: true,
                data: {
                    id: 'kakao_user_id'
                }
            });
            UserService.findBySocialId.mockResolvedValue(null);
            UserService.createSocialUser.mockResolvedValue(null); // 사용자 생성 실패

            // 테스트 실행 및 에러 기대
            await expect(LoginService.socialLogin('kakao', 'test_code')).rejects.toThrow('Failed to create user account');
        });
    });
}); 