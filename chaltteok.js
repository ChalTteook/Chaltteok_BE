import express from "express";

const port = 9801;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended : false }));

app.listen(port, '0.0.0.0', () => {
  console.log(`Backend Port : ${port}`);
  
});