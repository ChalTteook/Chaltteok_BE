import axios from 'axios';
import SocialAuthService from './socialAuthService.js';

class KakaoAuthService extends SocialAuthService {
    constructor() {
        super({
            authUrl: 'https://kauth.kakao.com',
            apiUrl: 'https://kapi.kakao.com',
            clientId: 'fe0e720fbe5b74240985fb33256f2826',
            redirectUri: 'http://127.0.0.1',
            state: '1234'
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