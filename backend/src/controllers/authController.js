const prisma = require("../config/prisma.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof username !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !username.trim() ||
      password.trim().length < 8
    ) {
      return res.status(400).json({
        message: "Valid user data are required",
      });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: email.trim() }, { username: username.trim() }],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password.trim(), 10);
    const user = await prisma.user.create({
      data: {
        username: username.trim(),
        email: email.trim(),
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Internal server error. ${error.message}`,
    });
  }
};

const login = async (req, res) => {
  try {
    const { login, password } = req.body;

    if (
      typeof login !== "string" ||
      typeof password !== "string" ||
      !login.trim() ||
      !password.trim()
    ) {
      return res.status(400).json({
        message: "Login and password are required",
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: login.trim() }, { username: login.trim() }],
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "Invalid email or username",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Wrong password",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      },
    );

    return res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Internal server error. ${error.message}`,
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        password: false,
        posts: true,
        comments: true,
      },
      orderBy: { id: "asc" },
    });

    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({
      message: `Internal server error.${error.message}`,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await prisma.user.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      message: "User deleted",
    });
  } catch (error) {
    return res.status(500).json({
      message: `Internal server error. ${error.message}`,
    });
  }
};

module.exports = { register, login, getAllUsers, deleteUser };
