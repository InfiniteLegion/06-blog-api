const prisma = require("../config/prisma.js");

const getPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: {
        publishedAt: "desc",
      },
      include: {
        categories: true,
      },
    });

    return res.status(200).json(posts);
  } catch (error) {
    return res.status(500).json({
      message: `Internal server error. ${error.message}`,
    });
  }
};

const getById = async (req, res) => {
  try {
    const postId = Number(req.params.id);

    if (!Number.isInteger(postId) || postId <= 0) {
      return res.status(400).json({
        message: "Invalid post ID",
      });
    }

    const post = await prisma.post.findFirst({
      where: {
        id: postId,
      },
      include: {
        categories: true,
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    return res.status(200).json(post);
  } catch (error) {
    return res.status(500).json({
      message: `Internal server error. ${error.message}`,
    });
  }
};

const create = async (req, res) => {
  try {
    const { title, text, status, categories } = req.body;

    if (
      typeof title !== "string" ||
      typeof text !== "string" ||
      typeof status !== "string" ||
      !title.trim() ||
      !text.trim()
    ) {
      return res.status(400).json({
        message: "Title and text are required",
      });
    }

    if (categories.length <= 0) {
      return res.status(400).json({
        message: "At least 1 category required",
      });
    }

    const post = await prisma.post.create({
      data: {
        title: title.trim(),
        text: text.trim(),
        status,
        categories: {
          connect: categories.map((id) => ({ id })),
        },
        userId: req.user.userId,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
      },
      include: {
        categories: true,
      },
    });

    return res.status(201).json(post);
  } catch (error) {
    return res.status(500).json({
      message: `Internal server error. ${error.message}`,
    });
  }
};

const update = async (req, res) => {
  try {
    const postId = Number(req.params.id);
    const userId = req.user.userId;
    const role = req.user.role;
    const { title, text, status, categories } = req.body;

    if (!Number.isInteger(postId) || postId <= 0) {
      return res.status(400).json({
        message: "Invalid post ID",
      });
    }

    if (
      (title !== undefined && (typeof title !== "string" || !title.trim())) ||
      (text !== undefined && (typeof text !== "string" || !text.trim())) ||
      (status !== undefined && (typeof status !== "string" || !status))
    ) {
      return res.status(400).json({
        message: "Invalid post data",
      });
    }

    if (categories !== undefined && categories.length <= 0) {
      return res.status(400).json({
        message: "At least 1 category required",
      });
    }

    const existingPost = await prisma.post.findFirst({
      where: {
        id: postId,
      },
    });

    if (!existingPost) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const isAuthor = userId === existingPost.userId;
    const isAdmin = role === "ADMIN";

    if (!(isAuthor || isAdmin)) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    const updatedPost = await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(text !== undefined && { text: text.trim() }),
        ...(status !== undefined && { status: status }),
        ...(categories !== undefined && {
          categories: {
            set: categories.map((id) => ({ id })),
          },
        }),
      },
      include: {
        categories: true,
      },
    });

    return res.status(200).json({
      message: "Post updated",
      updatedPost,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Internal server error. ${error.message}`,
    });
  }
};

const deletePost = async (req, res) => {
  try {
    const postId = Number(req.params.id);
    const userId = Number(req.user.userId);
    const role = req.user.role;

    if (!Number.isInteger(postId) || postId <= 0) {
      return res.status(400).json({
        message: "Invalid post ID",
      });
    }

    const post = await prisma.post.findFirst({
      where: {
        id: postId,
      },
    });

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const isAuthor = post.userId === userId;
    const isAdmin = role === "ADMIN";

    if (!(isAdmin || isAuthor)) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    await prisma.post.delete({
      where: {
        id: postId,
      },
    });

    return res.status(200).json({
      message: "Post deleted",
    });
  } catch (error) {
    return res.status(500).json({
      message: `Internal server error. ${error.message}`,
    });
  }
};

const publishPost = async (req, res) => {
  try {
    const postId = Number(req.params.id);
    const userId = req.user.userId;
    const role = req.user.role;

    if (!Number.isInteger(postId) || postId <= 0) {
      return res.status(400).json({
        message: "Invalid post ID",
      });
    }

    const post = await prisma.post.findFirst({
      where: {
        id: postId,
      },
    });

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const isAuthor = post.userId === userId;
    const isAdmin = role === "ADMIN";

    if (!(isAdmin || isAuthor)) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    const isPublished = post.status === "PUBLISHED";

    if (isPublished) {
      return res.status(400).json({
        message: "Post already published",
      });
    }

    const publishedPost = await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });

    return res.status(200).json(publishedPost);
  } catch (error) {
    return res.status(500).json({
      message: `Internal server error. ${error.message}`,
    });
  }
};

module.exports = { getPosts, getById, create, update, deletePost, publishPost };
