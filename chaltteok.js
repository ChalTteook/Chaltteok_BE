import express from "express";
import UserRouter from "./src/controllers/userController.js";
import AuthRouter from "./src/controllers/authController.js";
import ShopRouter from "./src/controllers/shopController.js";
import CommonRouter from "./src/controllers/commonControlller.js";
import ReviewRouter from "./src/controllers/reviewController.js";
import ReportRouter from "./src/controllers/reportController.js";
import AdminReportRouter from "./src/controllers/adminReportController.js";
import AdminPartnerShopRouter from "./src/controllers/adminPartnerShopController.js";
import SnapArtistRouter from "./src/controllers/snapArtistController.js";
import { handleGenericError } from "./src/utils/errorHandler.js";
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

// 라우터 등록
app.use(`${basePath}/common`, CommonRouter);
app.use(`${basePath}/user`, UserRouter);
app.use(`${basePath}/auth`, AuthRouter);
app.use(`${basePath}/shops`, ShopRouter);
app.use(`${basePath}/shops`, ReviewRouter);
app.use(`${basePath}/reviews`, ReviewRouter);
app.use(`${basePath}/reports`, ReportRouter);
app.use(`${basePath}/admin/reports`, AdminReportRouter);
app.use(`${basePath}/admin/partner-shops`, AdminPartnerShopRouter);
app.use(`${basePath}/snap-artists`, SnapArtistRouter);

// 오류 처리 미들웨어 등록 (라우터 설정 이후에 등록해야 함)
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