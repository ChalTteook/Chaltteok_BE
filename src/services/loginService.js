import UserService from './userService.js';
import JwtUtil from '../utils/jwtUtil.js';

class LoginService {
    async login(email, password) {
        const user = await UserService.findByEmail(email);
        if (user && await user.verifyPassword(password)) {
            const token = JwtUtil.generateToken({ userId: user.id });
            return { user, token };
        }
        return null;
    }

    async socialLogin(socialId) {
        const user = await UserService.findBySocialId(socialId);
        return user;
    }
}

export default new LoginService();