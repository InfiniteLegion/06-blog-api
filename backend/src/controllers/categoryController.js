const prisma = require("../config/prisma.js");

const getAll = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });

    return res.status(200).json(categories);
  } catch (error) {
    return res.status(500).json({
      message: `Internal server error. ${error.message}`,
    });
  }
};

const create = async (req, res) => {
  try {
    const { name } = req.body;

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        message: "Category name required",
      });
    }

    const existingCategory = await prisma.category.findUnique({
      where: {
        name: name.trim(),
      },
    });

    if (existingCategory) {
      return res.status(400).json({
        message: "Category already exists",
      });
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
      },
    });

    return res.status(201).json(category);
  } catch (error) {
    return res.status(500).json({
      message: `Internal server error. ${error.message}`,
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const categoryId = Number(req.params.id);

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return res.status(400).json({
        message: "Invalid category ID",
      });
    }

    const existingCategory = await prisma.category.findFirst({
      where: {
        id: categoryId,
      },
    });

    if (!existingCategory) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    await prisma.category.delete({
      where: {
        id: categoryId,
      },
    });

    return res.status(200).json({
      message: "Category deleted",
    });
  } catch (error) {
    return res.status(500).json({
      message: `Internal server error. ${error.message}`,
    });
  }
};

module.exports = { getAll, create, deleteCategory };
