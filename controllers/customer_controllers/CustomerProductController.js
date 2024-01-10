const Product = require('../../models/Product');
const Category = require('../../models/Category');

exports.getAllProduct = async (req, res) => {

  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Use find to retrieve paginated products
    const products = await Product.find({ isPublished: true })
      .populate({
        path: 'colorvariants',
        populate: ['images', 'sizevariants']
      })
      .skip(skip)
      .limit(limit)
      .exec();

    if (!products) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Get the total count of products
    const totalProducts = await Product.countDocuments({ isPublished: true });

    const totalPages = Math.ceil(totalProducts / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;
    const categories = await Category.find();

    res.status(200).json({
      categories,
      products,
      pagination: {
        page_no: page,
        per_page: limit,
        total_products: totalProducts,
        total_pages: totalPages,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findOne({ _id: id, isPublished: true }).populate({
      path: 'colorvariants',
      populate: ['images', 'sizevariants']
    })
      .exec();

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json({
      product
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getProductsByKeyword = async (req, res) => {

  try {
    const { keyword } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Use a regular expression to perform a case-insensitive search
    const keywordRegex = new RegExp(keyword, 'i');

    // Find all products that match the keyword, and apply pagination
    const products = await Product.find({ keyword: keywordRegex, isPublished: true })
      .populate({
        path: 'colorvariants',
        populate: ['images', 'sizevariants']
      })
      .skip(skip)
      .limit(limit)
      .exec();


    // Get the total count of products that match the keyword
    const totalProducts = await Product.countDocuments({ keyword: keywordRegex, isPublished: true });

    const totalPages = Math.ceil(totalProducts / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    res.status(200).json({
      products,
      pagination: {
        page_no: page,
        per_page: limit,
        total_products: totalProducts,
        total_pages: totalPages,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getProductByCategoryId = async (req, res) => {
  const { id } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const products = await Product.find({ category: id, isPublished: true }).populate({
      path: 'colorvariants',
      populate: ['images', 'sizevariants']
    })
      .skip(skip)
      .limit(limit)
      .exec();


    if (!products) {
      return res.status(404).json({ error: 'Product not found' });
    }
    // Get the total count of products that match the keyword
    const totalProducts = await Product.countDocuments({ category: id, isPublished: true });

    const totalPages = Math.ceil(totalProducts / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    res.status(200).json({
      products,
      pagination: {
        page_no: page,
        per_page: limit,
        total_products: totalProducts,
        total_pages: totalPages,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};