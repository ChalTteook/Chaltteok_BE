import express from "express";
import UserRouter from "./src/controllers/userController.js";
import AuthRouter from "./src/controllers/AuthController.js";

const port = 9801;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended : false }));


app.use('/user', UserRouter);
app.use('/auth', AuthRouter);

app.listen(port, '0.0.0.0', () => {
  console.log(`Backend Port : ${port}`);
  
});