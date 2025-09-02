import { uploadToR2, getR2Url } from './r2Util.js';
import path from 'path';
import uuid4 from 'uuid4';

// 허용된 이미지 MIME 타입 목록
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// R2에 프로필 이미지 업로드 함수
export const uploadProfileImageToR2 = async (file) => {
    const ext = path.extname(file.originalname);
    const r2Key = `profile-images/${uuid4()}${ext}`;
    const imageUrl = await uploadToR2(r2Key, file.buffer, file.mimetype);
    return imageUrl;
};

// R2 프로필 이미지 URL 생성 함수
export const getProfileImageR2Url = (filename) => {
    if (!filename) return null;
    return getR2Url(`profile-images/${filename}`);
};