import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

class JwtUtil {
    constructor(secretKey = process.env.JWT_SECRET_KEY) {
        this.secretKey = secretKey;
        // this.tokenExpiration = '1h';
        // this.refreshTokenExpiration = '7d';
    }

    generateToken(payload) {
        try {
            return jwt.sign(payload, this.secretKey, { 
                // expiresIn: this.tokenExpiration 
            });
        } catch(error) {
            console.log(error);
        }
        
    }

    generateRefreshToken(payload) {
        return jwt.sign(payload, this.secretKey, { 
            expiresIn: this.refreshTokenExpiration 
        })[1];
    }

    verifyToken(token) {
        try {
            return jwt.verify(token, this.secretKey);
        } catch (error) {
            return null;
        }
    }

    refreshToken(token) {
        try {
            const decoded = this.verifyToken(token);
            if (!decoded) return null;

            const payload = {
                userId: decoded.userId,
                isAdmin: decoded.isAdmin
            };

            return this.generateToken(payload);
        } catch (error) {
            console.error('Error refreshing token:', error);
            return null;
        }
    }

    decodeToken(token) {
        return jwt.decode(token);
    }

    getAuthMiddleware() {
        return (req, res, next) => {
            const token = req.headers['authorization']?.split(' ')[1];
            

            if (!token || token === 'null') {
                return res.status(401).json({
                    result: 'forbidden-approach',
                    message: '로그인이 필요한 서비스입니다.'
                });
            }

            try {
                const decoded = this.verifyToken(token);
                if (!decoded) {
                    return res.status(401).json({
                        result: 'forbidden-approach',
                        message: '유효하지 않은 토큰입니다.'
                    });
                }

                req.user = decoded;
                next();
            } catch (error) {
                return res.status(401).json({
                    result: 'forbidden-approach',
                    message: '인증에 실패했습니다.'
                });
            }
        };
    }
}

export default new JwtUtil();
