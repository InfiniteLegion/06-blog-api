const prisma = require("../config/prisma.js");

const getAllByPostId = async (req, res) => {
  try {
    const postId = Number(req.params.postId);

    if (!Number.isInteger(postId) || postId <= 0) {
      return res.status(400).json({
        message: "Invalid post ID",
      });
    }

    const comments = await prisma.comment.findMany({
      where: {
        postId: postId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    return res.status(200).json(comments);
  } catch (error) {
    return res.status(500).json({
      message: `Internal server error. ${error.module}`,
    });
  }
};

const create = async (req, res) => {
  try {
    const postId = Number(req.params.postId);
    const userId = req.user.userId;
    const { text } = req.body;

    if (!Number.isInteger(postId) || postId <= 0) {
      return res.status(400).json({
        message: "Invalid post ID",
      });
    }

    if (typeof text !== "string" || !text.trim()) {
      return res.status(400).json({
        message: "Comment text required",
      });
    }

    const comment = await prisma.comment.create({
      data: {
        text: text.trim(),
        userId,
        postId,
      },
    });

    return res.status(200).json(comment);
  } catch (error) {
    return res.status(500).json({
      message: `Internal server error. ${error.message}`,
    });
  }
};

const update = async (req, res) => {
  try {
    const postId = Number(req.params.postId);
    const commentId = Number(req.params.commentId);
    const userId = req.user.userId;
    const role = req.user.role;
    const { text } = req.body;

    if (
      !Number.isInteger(commentId) ||
      commentId <= 0 ||
      !Number.isInteger(postId) ||
      postId <= 0
    ) {
      return res.status(400).json({
        message: "Invalid post ID or comment ID",
      });
    }

    if (text !== undefined && (typeof text !== "string" || !text.trim())) {
      return res.status(400).json({
        message: "Invalid comment text",
      });
    }

    if (text === undefined) {
      return res.status(400).json({
        message: "Nothing to update",
      });
    }

    const existingComment = await prisma.comment.findFirst({
      where: {
        id: commentId,
      },
    });

    if (!existingComment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    const isAuthor = existingComment.userId === userId;
    const isAdmin = role === "ADMIN";

    if (!(isAdmin || isAuthor)) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    const updatedComment = await prisma.comment.update({
      where: {
        id: commentId,
        postId,
      },
      data: {
        ...(text !== undefined && { text: text.trim() }),
      },
    });

    return res.status(200).json({
      message: "Comment updated",
      updatedComment,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Internal server error. ${error.message}`,
    });
  }
};

const deleteComment = async (req, res) => {
  try {
    const postId = Number(req.params.postId);
    const commentId = Number(req.params.commentId);
    const userId = req.user.userId;
    const role = req.user.role;

    if (
      !Number.isInteger(commentId) ||
      commentId <= 0 ||
      !Number.isInteger(postId) ||
      postId <= 0
    ) {
      return res.status(400).json({
        message: "Invalid post ID or comment ID",
      });
    }

    const comment = await prisma.comment.findFirst({
      where: {
        id: commentId,
        postId,
      },
    });

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    const isAuthor = comment.userId === userId;
    const isAdmin = role === "ADMIN";

    if (!(isAuthor || isAdmin)) {
      return res.status(404).json({
        message: "Forbidden",
      });
    }

    await prisma.comment.delete({
      where: {
        id: commentId,
        postId,
      },
    });

    return res.status(200).json({
      message: "Comment deleted",
    });
  } catch (error) {
    return res.status(500).json({
      message: `Internal server error. ${error.message}`,
    });
  }
};

module.exports = { getAllByPostId, create, update, deleteComment };
