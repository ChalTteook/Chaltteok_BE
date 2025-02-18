import express from "express";
import UserRouter from "./src/controllers/userController.js";
import AuthRouter from "./src/controllers/authController.js";
import StudioRouter from "./src/controllers/studioController.js"

const port = 9801;
const app = express();
const basePath = '/api/v1';

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(`${basePath}/user`, UserRouter);
app.use(`${basePath}/auth`, AuthRouter);
app.use(`${basePath}/studios`, StudioRouter);

app.listen(port, '0.0.0.0', () => {
  console.log(`Backend Port : ${port}`);
});