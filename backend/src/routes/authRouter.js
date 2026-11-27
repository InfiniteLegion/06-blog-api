const { Router } = require("express");
const authController = require("../controllers/authController.js");
const {
  requireRole,
  authenticateToken,
} = require("../middleware/authMiddleware.js");

const authRouter = Router();

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);

authRouter.use(authenticateToken);

authRouter.get("/users", requireRole("ADMIN"), authController.getAllUsers);
authRouter.get("/users/:userId", authController.getUserById);
authRouter.patch("/users/:userId", authController.update);
authRouter.delete(
  "/users/:id",
  requireRole("ADMIN"),
  authController.deleteUser,
);

module.exports = authRouter;
