// 소셜 로그인 기본 인터페이스
class SocialAuthService {
    constructor(config) {
        this.authUrl = config.authUrl;
        this.apiUrl = config.apiUrl;
        this.clientId = config.clientId;
        this.clientSecret = config.clientSecret;
        this.redirectUri = config.redirectUri;
        this.state = config.state;
    }

    async getAccessToken() {
        throw new Error('Method not implemented');
    }

    async getUserInfo() {
        throw new Error('Method not implemented');
    }
}

export default SocialAuthService; 