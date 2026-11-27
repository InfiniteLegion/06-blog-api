const { Router } = require("express");
const commentController = require("../controllers/commentController.js");
const { authenticateToken } = require("../middleware/authMiddleware.js");

const commentRouter = Router({ mergeParams: true });

commentRouter.get("/", commentController.getAllByPostId);

commentRouter.use(authenticateToken);

commentRouter.post("/", commentController.create);
commentRouter.patch("/:commentId", commentController.update);
commentRouter.delete("/:commentId", commentController.deleteComment);

module.exports = commentRouter;
