require("dotenv").config();
const express = require("express");
const authRouter = require("./src/routes/authRouter.js");
const postRouter = require("./src/routes/postRouter.js");
const categoryRouter = require("./src/routes/categoryRouter.js");

const app = express();
const PORT = 3000;

app.use(express.json());

app.use("/auth", authRouter);
app.use("/categories", categoryRouter);
app.use("/posts", postRouter);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
