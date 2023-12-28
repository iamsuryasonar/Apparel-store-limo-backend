const Product = require('../../models').Product;
const { Op } = require('sequelize');

exports.getAllProduct = async (req, res) => {
  //todo --- only find products that are published
  // also get specification with variant, subcategory and brand

  try {
    const page = parseInt(req.query.page) || 1; // set default page number to 1 if not provided
    const limit = parseInt(req.query.limit) || 10; // set default limit to 10 if not provided
    const offset = (page - 1) * limit;

    const { count, rows } = await Product.findAndCountAll({
      offset,
      limit,
    });

    const totalPages = Math.ceil(count / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    res.status(200).json({
      products: rows,
      pagination: {
        currentPage: page,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getProductById = async (req, res) => {
  //todo --- only find products that are published

  try {
    const ProductId = req.params.ProductId;
    const page = parseInt(req.query.page) || 1; // set default page number to 1 if not provided
    const limit = parseInt(req.query.limit) || 10; // set default limit to 10 if not provided
    const offset = (page - 1) * limit;

    const { count, rows } = await Product.findAndCountAll({
      where: {
        id: ProductId
      },
      offset,
      limit,
    });

    const totalPages = Math.ceil(count / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    res.status(200).json({
      products: rows,
      pagination: {
        currentPage: page,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getProductByKeyword = async (req, res) => {
  //todo --- only find products that are published
  // also get specification with variant, subcategory and brand

  const { keyword } = req.params;
  try {
    const page = parseInt(req.query.page) || 1; // set default page number to 1 if not provided
    const limit = parseInt(req.query.limit) || 10; // set default limit to 10 if not provided
    const offset = (page - 1) * limit;

    const { count, rows } = await Product.findAndCountAll({
      where: {
        keyword: {
          [Op.like]: `%${keyword}%`
        }
      },
      offset,
      limit,
    });

    const totalPages = Math.ceil(count / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    res.status(200).json({
      products: rows,
      pagination: {
        currentPage: page,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};