const Product = require('../../models/Product');
const Category = require('../../models/Category');
const { success, error, validation } = require('../../common/responseAPI')
const mongoose = require('mongoose');

exports.getAllProduct = async (req, res) => {

  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const products = await Product.find({ isPublished: true })
      .populate({
        path: 'colorvariants',
        populate: ['images', 'sizevariants']
      })
      .skip(skip)
      .limit(limit)
      .exec();

    const totalProducts = await Product.countDocuments({ isPublished: true });

    const totalPages = Math.ceil(totalProducts / limit);

    const categories = await Category.find();

    res.status(200).json(success("OK", {
      categories,
      products,
      pagination: {
        page_no: page,
        per_page: limit,
        total_products: totalProducts,
        total_pages: totalPages,
      },
    },
      res.statusCode),
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json(error("Something went wrong", res.statusCode));
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findOne({ _id: id, isPublished: true })
      .populate('category')
      .populate({
        path: 'colorvariants',
        populate: ['images', 'sizevariants']
      })
      .exec();

    if (!product) return res.status(404).json(error("Product not found!", res.statusCode));

    res.status(200).json(success("OK", {
      product
    },
      res.statusCode),
    );
  } catch (err) {
    return res.status(500).json(error("Something went wrong", res.statusCode));
  }
};

exports.getProductsByKeyword = async (req, res) => {

  try {
    const { keyword } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const keywordRegex = new RegExp(keyword, 'i');

    const products = await Product.find({ keyword: keywordRegex, isPublished: true })
      .populate({
        path: 'colorvariants',
        populate: ['images', 'sizevariants']
      })
      .skip(skip)
      .limit(limit)
      .exec();

    const totalProducts = await Product.countDocuments({ keyword: keywordRegex, isPublished: true });

    const totalPages = Math.ceil(totalProducts / limit);

    res.status(200).json(success("OK", {
      products,
      pagination: {
        page_no: page,
        per_page: limit,
        total_products: totalProducts,
        total_pages: totalPages,
      },
    },
      res.statusCode),
    );
  } catch (err) {
    return res.status(500).json(error("Something went wrong", res.statusCode));

  }
};

exports.getProductByCategoryId = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const category = await Category.findById(id);
    if (!category) return res.status(422).json(validation({ categoryId: "Invalid category id" }));

    const { from, to, sort_type } = req.query;
    const products = await Product.aggregate([
      {
        $match: {
          category: mongoose.Types.ObjectId(id),
        }
      },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category"
        }
      },
      {
        $unwind: "$category"
      },
      {
        $lookup: {
          from: "colorvariants",
          localField: "_id",
          foreignField: "product",
          as: "colorVariants"
        }
      },
      {
        $unwind: "$colorVariants"
      },
      {
        $lookup: {
          from: "sizevariants",
          localField: "colorVariants._id",
          foreignField: "colorVariant",
          as: "sizeVariants"
        }
      },
      {
        $unwind: "$sizeVariants"
      },
      {
        $match: {
          'sizeVariants.selling_price': {
            $gt: Number(from),
            $lt: Number(to)
          }
        }
      },
      {
        $lookup: {
          from: "images",
          localField: "colorVariants._id",
          foreignField: "colorVariant",
          as: "images"
        }
      },
      {
        $facet: {
          count: [
            { $group: { _id: null, count: { $sum: 1 } } },
          ],
          matchedResults: [
            { $match: { 'sizeVariants.selling_price': { $gt: Number(from), $lt: Number(to) } } },
            { $skip: skip },
            ...(sort_type === 'ASCENDING' ? [{ $sort: { 'sizeVariants.selling_price': 1 } }] : []),
            ...(sort_type === 'DECENDING' ? [{ $sort: { 'sizeVariants.selling_price': -1 } }] : [])
          ],
        },
      },
    ]);

    const totalProducts = products[0]?.count[0]?.count;
    const totalPages = Math.ceil(totalProducts / limit);

    res.status(200).json(success("OK", {
      products: products[0].matchedResults,
      pagination: {
        page_no: page,
        per_page: limit,
        total_products: totalProducts,
        total_pages: totalPages,
      },
    },
      res.statusCode),
    );
  } catch (err) {
    return res.status(500).json(error("Something went wrong", res.statusCode));
  }
};

exports.getProductsByName = async (req, res) => {

  try {
    const { name } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const keywordRegex = new RegExp(name, 'i');

    const products = await Product.find({ name: keywordRegex, isPublished: true })
      .populate({
        path: 'colorvariants',
        populate: ['images', 'sizevariants']
      })
      .skip(skip)
      .limit(limit)
      .exec();

    const totalProducts = await Product.countDocuments({ name: keywordRegex, isPublished: true });

    const totalPages = Math.ceil(totalProducts / limit);

    res.status(200).json(success("OK", {
      products,
      pagination: {
        page_no: page,
        per_page: limit,
        total_products: totalProducts,
        total_pages: totalPages,
      },
    },
      res.statusCode),
    );
  } catch (err) {
    return res.status(500).json(error("Something went wrong", res.statusCode));

  }
};
