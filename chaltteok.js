import express from "express";
import UserRouter from "./src/controllers/userController.js";
import AuthRouter from "./src/controllers/AuthController.js";

const port = 9801;
const app = express();
const basePath = '/app/v1';

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(`${basePath}/user`, UserRouter);
app.use(`${basePath}/auth`, AuthRouter);

app.listen(port, '0.0.0.0', () => {
  console.log(`Backend Port : ${port}`);
});