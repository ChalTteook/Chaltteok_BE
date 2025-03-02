import express from "express";
import UserRouter, { setupStaticFileServing } from "./src/controllers/userController.js";
import AuthRouter from "./src/controllers/authController.js";
import ShopRouter from "./src/controllers/shopController.js";
import CommonRouter from "./src/controllers/commonControlller.js"
import cors from 'cors'

const port = 9801;
const app = express();
const basePath = '/api/v1';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 정적 파일 서비스 설정 (프로필 이미지 및 업로드 파일 제공)
setupStaticFileServing(app);

app.use(`${basePath}/common`, CommonRouter)
app.use(`${basePath}/user`, UserRouter);
app.use(`${basePath}/auth`, AuthRouter);
app.use(`${basePath}/shops`, ShopRouter);

app.listen(port, '0.0.0.0', () => {
  console.log(`Backend Port : ${port}`);
});