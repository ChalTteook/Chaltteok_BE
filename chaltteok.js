import express from "express";
import UserRouter, { setupStaticFileServing } from "./src/controllers/userController.js";
import AuthRouter from "./src/controllers/authController.js";
import ShopRouter from "./src/controllers/shopController.js";
import CommonRouter from "./src/controllers/commonControlller.js";
import ReviewRouter from "./src/controllers/reviewImageController.js";
import CommentRouter from "./src/controllers/commentController.js";
import { handleMulterError, handleGenericError } from "./src/utils/errorHandler.js";
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const port = 9801;
const app = express();
const basePath = '/api/v1';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 업로드 디렉토리 확인 및 생성
const uploadDirs = [
  path.join(process.cwd(), 'uploads'),
  path.join(process.cwd(), 'uploads/review-images')
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`디렉토리 생성됨: ${dir}`);
  }
});

// 정적 파일 서비스 설정 (프로필 이미지 및 업로드 파일 제공)
setupStaticFileServing(app);

app.use(`${basePath}/common`, CommonRouter);
app.use(`${basePath}/user`, UserRouter);
app.use(`${basePath}/auth`, AuthRouter);
app.use(`${basePath}/shops`, ShopRouter);
app.use(`${basePath}/reviews`, ReviewRouter);
app.use(`${basePath}/comments`, CommentRouter);

// 오류 처리 미들웨어 등록 (라우터 설정 이후에 등록해야 함)
app.use(handleMulterError);
app.use(handleGenericError);

app.listen(port, '0.0.0.0', () => {
  console.log(`Backend Port : ${port}`);
});