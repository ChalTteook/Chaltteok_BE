import axios from 'axios';
import SocialAuthService from './socialAuthService.js';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

class KakaoAuthService extends SocialAuthService {
    constructor() {
        super({
            authUrl: 'https://kauth.kakao.com',
            apiUrl: 'https://kapi.kakao.com',
            clientId: process.env.KAKAO_CLIENT_ID,
            redirectUri: process.env.KAKAO_REDIRECT_URI,
            state: process.env.KAKAO_STATE
        });
    }

    async getAccessToken(authorizationCode) {
        try {
            const response = await axios.get(`${this.authUrl}/oauth/token`, {
                params: {
                    grant_type: 'authorization_code',
                    client_id: this.clientId,
                    redirect_uri: this.redirectUri,
                    code: authorizationCode
                }
            });

            return {
                success: true,
                data: {
                    accessToken: response.data.access_token,
                    refreshToken: response.data.refresh_token,
                    expiresIn: response.data.expires_in
                }
            };
        } catch (error) {
            return {
                success: false,
                error: 'Failed to get Kakao access token',
                details: error.message
            };
        }
    }

    async getUserInfo(accessToken) {
        try {
            const response = await axios.get(`${this.apiUrl}/v2/user/me`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: 'Failed to get Kakao user info',
                details: error.message
            };
        }
    }
}

export default new KakaoAuthService(); 