import express from 'express';
import UserService from '../services/userService.js';
import JwtUtil from '../utils/jwtUtil.js';

const router = express.Router();

// Middleware to authenticate user based on JWT
const authenticateUser = (req, res, next) => {
    // const token = req.headers['authorization']?.split(' ')[1];
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const decoded = JwtUtil.verifyToken(token);
    if (!decoded) {
        return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = decoded; // Attach user info to request
    next();
};

// Get current user information
router.get('/me', authenticateUser, async (req, res) => {
    try {
        const user = await UserService.findById(req.user.userId); // Assuming userId is in the token
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get current user profile information
router.get('/me/profile', authenticateUser, async (req, res) => {
    try {
        const user = await UserService.findById(req.user.userId); // Assuming userId is in the token
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Return only profile-related information
        const profile = {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            socialId: user.socialId,
            type: user.type,
        };
        res.status(200).json({ success: true, profile });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// 프로필 업데이트
router.patch('/me/profile', authenticateUser, async (req, res) => {
    const { name, phone, address, age, gender, nickName } = req.body; // Extract fields to update
    try {
        const user = await UserService.findById(req.user.userId); // Assuming userId is in the token
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user data
        user.name = name || user.name; // Only update if provided
        user.phone = phone || user.phone;
        user.address = address || user.address;
        user.age = age !== undefined ? age : user.age; // Update age if provided
        user.gender = gender || user.gender; // Update gender if provided
        user.nickName = nickName || user.nickName; // Update nickName if provided

        // Save updated user data
        await UserService.updateUser(user);

        res.status(200).json({ success: true, message: 'Profile updated successfully', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// router.get('/:id', (request, response) => {
//     response.status(200).json({
//         "message": "node js get user"
//     });
//     console.log("request user id : " + request.params.id);
// });

// router.patch('/:id', (request, response) => {
//     response.status(200).json({
//         "message": "node js patch user"
//     });
// });

// router.delete('/:id', (request, response) => {
//     response.status(200).json({
//         "message": "node js delete user"
//     });
// });


export default router;
