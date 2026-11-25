require("dotenv").config();
const express = require("express");
const authRouter = require("./src/routes/authRouter.js");

const app = express();
const PORT = 3000;

app.use(express.json());

app.use("/auth", authRouter);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
