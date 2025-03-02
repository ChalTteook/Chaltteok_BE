import path from 'path';
import multer from 'multer';
import uuid4 from 'uuid4';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get the directory name from the current module's URL
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 프로필 이미지 저장 경로 설정
const PROFILE_IMAGE_PATH = path.join(__dirname, '../../uploads/profile-images');

// 디렉토리가 없으면 생성
if (!fs.existsSync(PROFILE_IMAGE_PATH)) {
    fs.mkdirSync(PROFILE_IMAGE_PATH, { recursive: true });
}

// 프로필 이미지 업로드를 위한 스토리지 설정
const profileImageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, PROFILE_IMAGE_PATH);
    },
    filename: function (req, file, cb) {
        // 원본 파일의 확장자 추출
        const ext = path.extname(file.originalname);
        // UUID로 고유한 파일 이름 생성
        const uniqueFileName = `${uuid4()}${ext}`;
        cb(null, uniqueFileName);
    }
});

// 일반적인 파일 업로드를 위한 스토리지 설정
const generalStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../../uploads/general');
        
        // 디렉토리가 없으면 생성
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const uniqueFileName = `${uuid4()}${ext}`;
        cb(null, uniqueFileName);
    }
});

// 파일 필터링 (이미지 파일만 허용)
const imageFileFilter = (req, file, cb) => {
    // 허용할 이미지 파일의 MIME 타입
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('지원하지 않는 파일 형식입니다. JPEG, PNG, GIF, WEBP 형식만 업로드 가능합니다.'), false);
    }
};

// 프로필 이미지용 Multer 설정
const uploadProfileImage = multer({
    storage: profileImageStorage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB로 용량 제한
    }
});

// 일반 파일용 Multer 설정
const uploadGeneralFile = multer({
    storage: generalStorage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB로 용량 제한
    }
});

// 프로필 이미지 URL 생성 함수
const getProfileImageUrl = (filename) => {
    if (!filename) return null;
    return `/uploads/profile-images/${filename}`;
};

export default {
    upload: uploadGeneralFile,
    uploadProfileImage,
    getProfileImageUrl,
    PROFILE_IMAGE_PATH
};