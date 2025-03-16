import path from 'path';
import multer from 'multer';
import uuid4 from 'uuid4';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get the directory name from the current module's URL
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 업로드 기본 경로 설정
const UPLOADS_BASE_PATH = path.join(__dirname, '../../uploads');
// 프로필 이미지 저장 경로 설정
const PROFILE_IMAGE_PATH = path.join(UPLOADS_BASE_PATH, 'profile-images');
// 일반 파일 업로드 경로 설정
const GENERAL_UPLOAD_PATH = path.join(UPLOADS_BASE_PATH, 'general');

// 모든 필요한 디렉토리가 없으면 생성하는 함수
const ensureDirectoryExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

// 필요한 모든 디렉토리 생성
ensureDirectoryExists(PROFILE_IMAGE_PATH);
ensureDirectoryExists(GENERAL_UPLOAD_PATH);

// 허용된 이미지 MIME 타입 목록
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// 파일 이름 생성 함수
const generateUniqueFilename = (originalFilename) => {
    const ext = path.extname(originalFilename);
    return `${uuid4()}${ext}`;
};

// 프로필 이미지 업로드를 위한 스토리지 설정
const profileImageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, PROFILE_IMAGE_PATH);
    },
    filename: (req, file, cb) => {
        cb(null, generateUniqueFilename(file.originalname));
    }
});

// 일반적인 파일 업로드를 위한 스토리지 설정
const generalStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, GENERAL_UPLOAD_PATH);
    },
    filename: (req, file, cb) => {
        cb(null, generateUniqueFilename(file.originalname));
    }
});

// 파일 필터링 (이미지 파일만 허용)
const imageFileFilter = (req, file, cb) => {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`지원하지 않는 파일 형식입니다. 허용된 형식: ${ALLOWED_IMAGE_TYPES.join(', ')}`), false);
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

// 일반 파일 URL 생성 함수
const getGeneralFileUrl = (filename) => {
    if (!filename) return null;
    return `/uploads/general/${filename}`;
};

// 파일 삭제 유틸리티 함수
const deleteFile = (filePath) => {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('파일 삭제 오류:', err);
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        } else {
            resolve(false); // 파일이 존재하지 않음
        }
    });
};

// 프로필 이미지 파일 삭제
const deleteProfileImage = async (filename) => {
    if (!filename) return false;
    const filePath = path.join(PROFILE_IMAGE_PATH, filename);
    return await deleteFile(filePath);
};

export default {
    upload: uploadGeneralFile,
    uploadProfileImage,
    getProfileImageUrl,
    getGeneralFileUrl,
    deleteProfileImage,
    PROFILE_IMAGE_PATH,
    GENERAL_UPLOAD_PATH,
    UPLOADS_BASE_PATH,
    ALLOWED_IMAGE_TYPES
};