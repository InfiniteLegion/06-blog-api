const { Router } = require("express");
const categoryController = require("../controllers/categoryController.js");
const {
  authenticateToken,
  requireRole,
} = require("../middleware/authMiddleware.js");

const categoryRouter = Router();

categoryRouter.get("/", categoryController.getAll);

categoryRouter.use(authenticateToken);

categoryRouter.post("/create", requireRole("ADMIN"), categoryController.create);

module.exports = categoryRouter;
