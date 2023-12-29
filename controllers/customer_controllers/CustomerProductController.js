const Product = require('../../models/Product');

exports.getAllProduct = async (req, res) => {
  //todo --- only find products that are published

  try {
    const page = parseInt(req.query.page) || 1; // set default page number to 1 if not provided
    const limit = parseInt(req.query.limit) || 10; // set default limit to 10 if not provided
    const skip = (page - 1) * limit;

    const products = await Product.find()
      .skip(skip)
      .limit(limit)
      .exec();

    const totalProducts = await Product.countDocuments();
    const totalPages = Math.ceil(totalProducts / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    res.status(200).json({
      products,
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Find the product based on the provided ProductId
    const product = await Product.findOne({ _id: ProductId });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Find all products, but limit and skip based on pagination parameters
    const products = await Product.find({})
      .skip(skip)
      .limit(limit)
      .exec();

    // Get the total count of products
    const totalProducts = await Product.countDocuments({});

    const totalPages = Math.ceil(totalProducts / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    res.status(200).json({
      products,
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

  try {
    const { keyword } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Use a regular expression to perform a case-insensitive search
    const keywordRegex = new RegExp(keyword, 'i');

    // Find all products that match the keyword, and apply pagination
    const products = await Product.find({ keyword: keywordRegex })
      .skip(skip)
      .limit(limit)
      .exec();

    // Get the total count of products that match the keyword
    const totalProducts = await Product.countDocuments({ keyword: keywordRegex });

    const totalPages = Math.ceil(totalProducts / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    res.status(200).json({
      products,
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