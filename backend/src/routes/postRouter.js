const { Router } = require("express");
const postController = require("../controllers/postController.js");
const commentRouter = require("./commentRouter.js");
const { authenticateToken } = require("../middleware/authMiddleware.js");

const postRouter = Router();

postRouter.get("/", postController.getPosts);
postRouter.get("/:id", postController.getById);

postRouter.use("/:postId/comments", commentRouter);

postRouter.use(authenticateToken);

postRouter.post("/create", postController.create);
postRouter.patch("/:id", postController.update);
postRouter.delete("/:id", postController.deletePost);
postRouter.patch("/:id/publish", postController.publishPost);

module.exports = postRouter;
