import axios from 'axios';
import SocialAuthService from './socialAuthService.js';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

class NaverAuthService extends SocialAuthService {
    constructor() {
        super({
            authUrl: 'https://nid.naver.com',
            apiUrl: 'https://openapi.naver.com',
            clientId: process.env.NAVER_CLIENT_ID,
            clientSecret: process.env.NAVER_CLIENT_SECRET,
            redirectUri: process.env.NAVER_REDIRECT_URI,
            state: process.env.NAVER_STATE
        });
    }

    async getAccessToken(code) {
        try {
            const response = await axios.get(`${this.authUrl}/oauth2.0/token`, {
                params: {
                    grant_type: 'authorization_code',
                    client_id: this.clientId,
                    client_secret: this.clientSecret,
                    code: code,
                    state: this.state
                }
            });

            if (response.data.error) {
                return {
                    success: false,
                    error: 'Failed to get Naver access token',
                    details: error.message
                };
            }

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
                error: 'Failed to get Naver access token',
                details: error.message
            };
        }
    }

    async getUserInfo(accessToken) {
        try {
            const response = await axios.get(`${this.apiUrl}/v1/nid/me`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (response.data.error) {
                return {
                    success: false,
                    error: 'Failed to get Naver user info',
                    details: error.message
                };
            }

            const userInfo = response.data.response;
            return {
                success: true,
                data: userInfo
            };
        } catch (error) {
            return {
                success: false,
                error: 'Failed to get Naver user info',
                details: error.message
            };
        }
    }
}

export default new NaverAuthService(); 