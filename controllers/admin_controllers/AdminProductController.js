const Product = require('../../models').Product;
const sequelize = require('../../config/db');


exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    res.status(200).json(product);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: '  Internal server error' });
  }
};

// todo: pagination required here
exports.getAllProducts = async (req, res) => {
  try {
    const product = await Product.findAll();
    res.status(200).json(product);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: '  Internal server error' });
  }
};

exports.addProduct = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { name, description, image, keyword, tag, mrp, selling_price, stock, status } = req.body;

    // Create the product
    const product = await Product.create({
      name, description, image, keyword, tag, mrp, selling_price, stock, status
    }, { transaction: t });

    await t.commit();

    res.status(201).json({ product });
  } catch (err) {
    await t.rollback();
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateProduct = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { name, description, image, keyword, tag, mrp, selling_price, stock, status } = req.body;

    // Find the product in the database
    const product = await Product.findByPk(id, { transaction: t });

    // If the product doesn't exist, return a 404 error
    if (!product) {
      await t.rollback();
      return res.status(404).json({ error: 'Product not found' });
    }

    await product.update({
      name: name || product.name,
      description: description || product.description,
      image: image || product.image,
      keyword: keyword || product.keyword,
      tag: tag || product.tag,
      mrp: mrp || product.mrp,
      selling_price: selling_price || product.selling_price,
      stock: stock || product.stock,
      status: status || product.status,
    }, { transaction: t });


    const updated_product = await Product.findOne({
      where: { id: id },
    }, { transaction: t });
    await t.commit();
    res.status(200).json(updated_product);
  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteProduct = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id, { transaction: t });
    if (!product) {
      await t.rollback();
      return res.status(404).json({ error: 'Product not found' });
    }
    await product.destroy({ transaction: t });
    await t.commit();

    res.status(204).json({ message: "Product deleted successfully!" });
  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};  