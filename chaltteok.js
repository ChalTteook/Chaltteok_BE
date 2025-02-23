import express from "express";
import UserRouter from "./src/controllers/userController.js";
import AuthRouter from "./src/controllers/authController.js";
<<<<<<< HEAD
import ShopRouter from "./src/controllers/shopController.js";
=======
import CommonRouter from "./src/controllers/commonControlller.js"
>>>>>>> dev_findPassword

const port = 9801;
const app = express();
const basePath = '/api/v1';

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(`${basePath}/common`, CommonRouter)
app.use(`${basePath}/user`, UserRouter);
app.use(`${basePath}/auth`, AuthRouter);
app.use(`${basePath}/shops`, ShopRouter);

app.listen(port, '0.0.0.0', () => {
  console.log(`Backend Port : ${port}`);
});