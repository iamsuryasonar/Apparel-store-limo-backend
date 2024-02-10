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
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const category = await Category.findById(id);
    if (!category) return res.status(422).json(validation({ categoryId: "Invalid category id" }));

    const { from, to, sort_type } = req.query;
    const products = await Product.aggregate([
      {
        $match: {
          category: mongoose.Types.ObjectId(id),// Match documents based on the provided category ID
        }
      },
      {
        $lookup: { // Perform a lookup to fetch category details
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category"
        }
      },
      {// Unwind the category array to obtain individual category details
        $unwind: "$category"
      },
      {// Lookup to fetch color variants related to the product
        $lookup: {
          from: "colorvariants",
          localField: "_id",
          foreignField: "product",
          as: "colorVariants"
        }
      },
      {// Unwind the colorVariants array
        $unwind: "$colorVariants"
      },
      {// Lookup to fetch size variants based on color variants
        $lookup: {
          from: "sizevariants",
          localField: "colorVariants._id",
          foreignField: "colorVariant",
          as: "sizeVariants"
        }
      },
      {// Unwind the sizeVariants array
        $unwind: "$sizeVariants"
      },
      {// Filter documents based on selling price within the specified range
        $match: {
          'sizeVariants.selling_price': {
            $gt: Number(from),
            $lt: Number(to)
          }
        }
      },
      {// Lookup to fetch images related to color variants
        $lookup: {
          from: "images",
          localField: "colorVariants._id",
          foreignField: "colorVariant",
          as: "images"
        }
      },
      {
        $addFields: {
          imagesCount: { $size: "$images" }, // Get the size of the images array and gets product information and assigns to keys
          _id: "$_id",
          name: "$name",
          description: "$description",
          tag: "$tag",
          keyword: "$keyword",
        }
      },
      {
        $addFields: {
          randomIndex: { $floor: { $multiply: ["$imagesCount", { $rand: {} }] } } // Generate a random index
        }
      },
      {
        $addFields: {
          randomizedImages: { $arrayElemAt: ["$images", "$randomIndex"] } // Get the image at the random index
        }
      },
      {
        $project: {
          category: 1,
          colorVariants: 1,
          sizeVariants: 1,
          image: "$randomizedImages", // Assign the randomized image to the image
          _id: 1,
          name: 1,
          description: 1,
          tag: 1,
          keyword: 1,
        }
      },
      {
        $facet: {// Use $facet to perform multiple aggregations within a single stage
          count: [// Count the total number of matched documents
            { $group: { _id: null, count: { $sum: 1 } } },
          ],
          // Retrieve matched results based on selling price range
          matchedResults: [// Filter documents based on selling price range
            { $match: { 'sizeVariants.selling_price': { $gt: Number(from), $lt: Number(to) } } },
            { $skip: skip },// Skip documents for pagination
            { $sample: { size: limit } },// Randomly select documents up to the specified limit
            // Sort the results based on sort_type
            ...(sort_type === 'ASCENDING' ? [{ $sort: { 'sizeVariants.selling_price': 1 } }] : []),
            ...(sort_type === 'DECENDING' ? [{ $sort: { 'sizeVariants.selling_price': -1 } }] : []),
          ],
        },
      },
    ]);

    const totalProducts = products[0]?.count[0]?.count;
    const totalPages = Math.ceil(totalProducts / limit);
    console.log(products[0].matchedResults)

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
    console.log(err)
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
