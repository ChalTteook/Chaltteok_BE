import express from "express";
import UserRouter, { setupStaticFileServing } from "./src/controllers/userController.js";
import AuthRouter from "./src/controllers/authController.js";
import ShopRouter from "./src/controllers/shopController.js";
import CommonRouter from "./src/controllers/commonControlller.js";
import ReviewRouter from "./src/controllers/reviewController.js";
import ReportRouter from "./src/controllers/reportController.js";
import AdminReportRouter from "./src/controllers/adminReportController.js";
import AdminPartnerShopRouter from "./src/controllers/adminPartnerShopController.js";
import { handleMulterError, handleGenericError } from "./src/utils/errorHandler.js";
import httpLogger from "./src/middlewares/httpLogger.js";
import logger, { logInfo, logError } from "./src/utils/logger.js";
import cors from 'cors';
import fs from 'fs';
import path from 'path';

// 서버 포트 설정
const port = process.env.PORT || 9801;
const app = express();
const basePath = '/api/v1';

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// HTTP 요청 로깅 미들웨어 등록
app.use(httpLogger);

// 업로드 디렉토리 확인 및 생성
const uploadDirs = [
  path.join(process.cwd(), 'uploads'),
  path.join(process.cwd(), 'uploads/review-images')
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    logInfo(`디렉토리 생성됨: ${dir}`);
  }
});

// 정적 파일 서비스 설정 (프로필 이미지 및 업로드 파일 제공)
setupStaticFileServing(app);

// 라우터 등록
app.use(`${basePath}/common`, CommonRouter);
app.use(`${basePath}/user`, UserRouter);
app.use(`${basePath}/auth`, AuthRouter);
app.use(`${basePath}/shops`, ShopRouter);
app.use(`${basePath}/reviews`, ReviewRouter);
app.use(`${basePath}/reports`, ReportRouter);
app.use(`${basePath}/admin/reports`, AdminReportRouter);
app.use(`${basePath}/admin/partner-shops`, AdminPartnerShopRouter);

// 오류 처리 미들웨어 등록 (라우터 설정 이후에 등록해야 함)
app.use(handleMulterError);
app.use(handleGenericError);

// 서버가 직접 실행될 때만 listen 실행
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(port, '0.0.0.0', () => {
    logInfo(`서버가 시작되었습니다 - http://localhost:${port}`);
    logInfo(`운영 환경: ${process.env.NODE_ENV || 'development'}`);
    logInfo(`API 기본 경로: ${basePath}`);
  });
  
  // 예기치 않은 오류 처리
  process.on('uncaughtException', (error) => {
    logError('처리되지 않은 예외 발생', error);
    // 안전하게 서버 종료
    server.close(() => {
      process.exit(1);
    });
    
    // 10초 내에 종료되지 않으면 강제 종료
    setTimeout(() => {
      process.exit(1);
    }, 10000);
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    logError('처리되지 않은 프로미스 거부', { reason, promise });
  });
}

// 테스트를 위해 app 내보내기
export default app;