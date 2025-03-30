import express from 'express';
import UserService from '../services/userService.js';
import JwtUtil from '../utils/jwtUtil.js';
import fileUploader from '../utils/fileUploader.js';
import path from 'path';
import fs from 'fs';

const router = express.Router();
const userService = UserService;
const upload = fileUploader.upload;
const uploadProfileImage = fileUploader.uploadProfileImage;
                   
// Middleware to authenticate user based on JWT
const authenticateUser = (req, res, next) => {
    // const token = req.headers['authorization']?.split(' ')[1];
    const token = req.headers.authorization.split(' ')[1];
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
        const user = await userService.findById(req.user.userId); // Assuming userId is in the token
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
        const user = await userService.findById(req.user.userId); // Assuming userId is in the token
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
            profileImage: user.profileImage ? fileUploader.getProfileImageUrl(user.profileImage) : null,
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
        const user = await userService.findById(req.user.userId); // Assuming userId is in the token
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
        await userService.updateUser(user);

        res.status(200).json({ success: true, message: 'Profile updated successfully', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// 비밀번호 변경
router.post('/change-password', authenticateUser, async (req, res) => {
    const { newPassword, confirmPassword } = req.body;
    if ( newPassword !== confirmPassword ) {
        return res.status(400).json({ success: false, message: 'invalid inputs' });
    }

    try {
        const user = await userService.findById(req.user.userId);
        await userService.changePassword(user, newPassword);
        return res.status(200).json({ success: true, message: 'password change success'})
        

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// 프로필 이미지 업로드
router.post('/me/profile-image', authenticateUser, (req, res, next) => {
    // 파일 형식 검증 미들웨어 전에 오류 처리
    uploadProfileImage.single('profileImage')(req, res, (err) => {
        if (err) {
            console.error('프로필 이미지 업로드 오류:', err.message);
            // multer 에러 처리
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ success: false, message: '파일 크기가 제한을 초과했습니다. (최대 5MB)' });
            }
            if (err.message && err.message.includes('지원하지 않는 파일 형식')) {
                return res.status(400).json({ success: false, message: err.message });
            }
            return res.status(400).json({ success: false, message: '파일 업로드 중 오류가 발생했습니다.' });
        }
        
        // 파일 없음 검사
        if (!req.file) {
            return res.status(400).json({ success: false, message: '이미지 파일이 필요합니다.' });
        }
        
        // 이 지점에서 파일이 유효하므로 계속 진행
        next();
    });
}, async (req, res) => {
    try {
        const user = await userService.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
        }

        // 이전 프로필 이미지가 있으면 삭제
        if (user.profileImage) {
            await fileUploader.deleteProfileImage(user.profileImage);
        }

        // 사용자 모델 업데이트
        user.profileImage = req.file.filename;
        await userService.updateUser(user);

        res.status(200).json({ 
            success: true, 
            message: '프로필 이미지가 업로드되었습니다.',
            profileImage: fileUploader.getProfileImageUrl(req.file.filename)
        });
    } catch (error) {
        console.error('프로필 이미지 업로드 오류:', error);
        // 파일이 업로드된 경우 에러 발생 시 삭제 시도
        if (req.file && req.file.filename) {
            try {
                await fileUploader.deleteProfileImage(req.file.filename);
            } catch (cleanupError) {
                console.error('업로드된 파일 정리 중 오류:', cleanupError);
            }
        }
        res.status(500).json({ success: false, message: '서버 오류' });
    }
});

// 프로필 이미지 삭제
router.delete('/me/profile-image', authenticateUser, async (req, res) => {
    try {
        const user = await userService.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
        }

        // 프로필 이미지가 있는 경우에만 삭제
        if (user.profileImage) {
            const deleteResult = await fileUploader.deleteProfileImage(user.profileImage);
            
            if (!deleteResult) {
                console.warn(`프로필 이미지 파일을 찾을 수 없습니다: ${user.profileImage}`);
            }

            // 사용자 모델 업데이트
            user.profileImage = null;
            await userService.updateUser(user);
        }

        res.status(200).json({ 
            success: true, 
            message: '프로필 이미지가 삭제되었습니다.'
        });
    } catch (error) {
        console.error('프로필 이미지 삭제 오류:', error);
        res.status(500).json({ success: false, message: '서버 오류' });
    }
});

// 정적 파일 제공 설정 (Express 애플리케이션 설정에서 사용)
const setupStaticFileServing = (app) => {
    // 업로드 루트 디렉토리 설정
    const uploadsRoot = path.join(process.cwd(), 'uploads');
    app.use('/uploads', express.static(uploadsRoot));

    // 프로필 이미지 디렉토리 설정
    const profileImagesPath = path.join(uploadsRoot, 'profile-images');
    app.use('/uploads/profile-images', express.static(profileImagesPath));
    
    console.log(`정적 파일 서비스 경로 설정 완료: ${uploadsRoot}`);
};

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

// 기존의 profile/upload 엔드포인트는 필요 없다면 제거
// router.post('/profile/upload', upload.single('file'), (req, res, next) => {
//   if (!req.file) {
//       return res.status(400).json({ error: 'No file uploaded' });
//   }
//   
//   // const { fieldname, originalname, encoding, mimetype, destination, filename, path, size } = req.file
//   const { name } = req.body;
//
//   console.log("file 데이터 : ", file);
//   console.log("body 데이터 : ", name);
//   // console.log("폼에 정의된 필드명 : ", fieldname);
//   // console.log("사용자가 업로드한 파일 명 : ", originalname);
//   // console.log("파일의 엔코딩 타입 : ", encoding);
//   // console.log("파일의 Mime 타입 : ", mimetype);
//   // console.log("파일이 저장된 폴더 : ", destination);
//   // console.log("destinatin에 저장된 파일 명 : ", filename);
//   // console.log("업로드된 파일의 전체 경로 ", path);
//   // console.log("파일의 바이트(byte 사이즈)", size);
//
//   res.json({ok: true, data: "Upload Ok"})
// })

export { setupStaticFileServing };
export default router;
