const Product = require('../../models/Product');
const mongoose = require('mongoose')

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// todo: pagination required here
exports.getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Use find to retrieve paginated products
    const products = await Product.find()
      .skip(skip)
      .limit(limit)
      .exec();

    // Get the total count of products
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

exports.addProduct = async (req, res) => {
  let session = await mongoose.startSession();
  session.startTransaction();

  try {
    let { name, description, image, keyword, tag, mrp, selling_price, stock, status } = req.body;
    if (stock <= 0) {
      status = 'OUT-STOCK'
    } else (
      status = 'IN-STOCK'
    )
    // Create the product
    const product = await Product.create(
      [{ name, description, image, keyword, tag, mrp, selling_price, stock, status }],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ product });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image, keyword, tag, mrp, selling_price, stock, status } = req.body;

    // Use updateOne to update the product
    const result = await Product.updateOne(
      { _id: id }, // Assuming id is the document's _id
      {
        $set: {
          name: name || '',
          description: description || '',
          image: image || '',
          keyword: keyword || '',
          tag: tag || '',
          mrp: mrp || 0, // assuming mrp is a number, adjust accordingly
          selling_price: selling_price || 0,
          stock: stock || 0,
          status: status || '',
        },
      }
    );

    // Check if the document was found and updated
    if (result.nModified === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Retrieve the updated product
    const updatedProduct = await Product.findById(id);

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Use deleteOne to delete the product
    const result = await Product.deleteOne({ _id: id }); // Assuming id is the document's _id

    // Check if the document was found and deleted
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(204).json({ message: 'Product deleted successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};  