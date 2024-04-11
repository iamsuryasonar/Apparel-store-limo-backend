const mongoose = require("mongoose");
const sharp = require('sharp');
const { uploadTos3, deleteS3Object } = require('../utils/s3');
const { success, error, validation } = require('../common/responseAPI')
const Product = require('../models/Product');
const Category = require('../models/Category');
const Image = require('../models/Image');
const SizeVariant = require('../models/SizeVariant');
const ColorVariant = require('../models/ColorVariant');
const PRODUCT_TAG = require("../common/constants");

// @desc   Gets all products
// @route   GET /api/v1/product/
// @access  Private/Admin

exports.getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const products = await Product.find()
      .populate({
        path: 'colorvariants',
        populate: ['images', 'sizevariants']
      })
      .skip(skip)
      .limit(limit)
      .exec();

    const totalProducts = await Product.countDocuments();

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


// @desc   Gets product by id (could be published or unpublished )
// @route   POST /api/v1/product/:id
// @access  Private/Admin

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate({
        path: 'colorvariants',
        populate: ['images', 'sizevariants']
      })
      .exec()

    if (!product) return res.status(404).json(error("Product not found", res.statusCode));

    res.status(200).json(success("OK", {
      product
    },
      res.statusCode),
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json(error("Something went wrong", res.statusCode));
  }
};

// @desc   Gets all products that are published
// @route   GET /api/v1/product/public/products
// @access  Public

exports.getAllPublishedProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const { from, to, sort_type } = req.query;
    const products = await Product.aggregate([
      {
        $match: {
          isPublished: true,// Match all published documents 
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
          as: "colorvariants"
        }
      },
      {// Unwind the colorVariants array
        $unwind: "$colorvariants"
      },
      {// Lookup to fetch size variants based on color variants
        $lookup: {
          from: "sizevariants",
          localField: "colorvariants._id",
          foreignField: "colorVariant",
          as: "sizevariants"
        }
      },
      {// Unwind the sizeVariants array
        $unwind: "$sizevariants"
      },
      {// Filter documents based on selling price within the specified range
        $match: {
          'sizevariants.selling_price': {
            $gt: Number(from),
            $lt: Number(to)
          }
        }
      },
      {// Lookup to fetch images related to color variants
        $lookup: {
          from: "images",
          localField: "colorvariants._id",
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
          colorvariants: 1,
          sizevariants: 1,
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
            { $match: { 'sizevariants.selling_price': { $gt: Number(from), $lt: Number(to) } } },
            { $sample: { size: 99999 } },// Randomly select documents up to the specified limit
            // Sort the results based on sort_type
            ...(sort_type === 'ASCENDING' ? [{ $sort: { 'sizevariants.selling_price': 1 } }] : []),
            ...(sort_type === 'DECENDING' ? [{ $sort: { 'sizevariants.selling_price': -1 } }] : []),
            { $skip: skip },// Skip documents for pagination
            { $limit: 12 },
          ],
        },
      },
    ])

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
    console.log(err)
    return res.status(500).json(error("Something went wrong", res.statusCode));
  }
};

// @desc   Gets a published product by id
// @route   GET /api/v1/product/product/:id
// @access  Public

exports.getPublishedProductById = async (req, res) => {
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
    console.log(err);
    return res.status(500).json(error("Something went wrong", res.statusCode));
  }
};

// @desc   Gets all products by keyword
// @route   GET /api/v1/product/keyword/:keyword
// @access  Public

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


// @desc   Gets all products by tag
// @route   GET /api/v1/product/tag/:tag
// @access  Public

exports.getProductsByTag = async (req, res) => {

  try {
    const { tag } = req.params;
    const limit = 4;

    const products = await Product.aggregate([
      {
        $match: {
          tag: tag,
          isPublished: true,// Match all published documents 
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
          as: "colorvariants"
        }
      },
      {// Unwind the colorVariants array
        $unwind: "$colorvariants"
      },
      {// Lookup to fetch size variants based on color variants
        $lookup: {
          from: "sizevariants",
          localField: "colorvariants._id",
          foreignField: "colorVariant",
          as: "sizevariants"
        }
      },
      {// Unwind the sizeVariants array
        $unwind: "$sizevariants"
      },
      {// Lookup to fetch images related to color variants
        $lookup: {
          from: "images",
          localField: "colorvariants._id",
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
          colorvariants: 1,
          sizevariants: 1,
          image: "$randomizedImages", // Assign the randomized image to the image
          _id: 1,
          name: 1,
          description: 1,
          tag: 1,
          keyword: 1,
        }
      },
      {
        $sort: { updatedAt: -1 } // Sort the results by updatedAt in descending order
      },
      {
        $limit: limit // Limit the number of results
      }
    ])

    res.status(200).json(success("OK",
      products,
      res.statusCode),
    );
  } catch (err) {
    console.log(err);
    return res.status(500).json(error("Something went wrong", res.statusCode));
  }
};


// @desc   Gets all products by category id
// @route   GET /api/v1/product/category/:id
// @access  Public

exports.getProductsByCategoryId = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    if (!id) return res.status(400).json({ success: false, message: 'Category id required' });

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
          as: "colorvariants"
        }
      },
      {// Unwind the colorVariants array
        $unwind: "$colorvariants"
      },
      {// Lookup to fetch size variants based on color variants
        $lookup: {
          from: "sizevariants",
          localField: "colorvariants._id",
          foreignField: "colorVariant",
          as: "sizevariants"
        }
      },
      {// Unwind the sizeVariants array
        $unwind: "$sizevariants"
      },
      {// Filter documents based on selling price within the specified range
        $match: {
          'sizevariants.selling_price': {
            $gt: Number(from),
            $lt: Number(to)
          }
        }
      },
      {// Lookup to fetch images related to color variants
        $lookup: {
          from: "images",
          localField: "colorvariants._id",
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
          colorvariants: 1,
          sizevariants: 1,
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
            { $match: { 'sizevariants.selling_price': { $gt: Number(from), $lt: Number(to) } } },
            { $sample: { size: 99999 } },// Randomly select documents up to the specified limit
            // Sort the results based on sort_type
            ...(sort_type === 'ASCENDING' ? [{ $sort: { 'sizevariants.selling_price': 1 } }] : []),
            ...(sort_type === 'DECENDING' ? [{ $sort: { 'sizevariants.selling_price': -1 } }] : []),
            { $skip: skip },// Skip documents for pagination
            { $limit: 12 },
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
    console.log(err)
    return res.status(500).json(error("Something went wrong", res.statusCode));
  }
};

// @desc   Gets all products by name
// @route   GET /api/v1/product/by_name/:name
// @access  Public

exports.getProductsByName = async (req, res) => {

  try {
    const { name } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const keywordRegex = new RegExp(name, 'i');

    const products = await Product.aggregate([
      {
        $match: {
          name: keywordRegex,
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
          as: "colorvariants"
        }
      },
      {// Unwind the colorVariants array
        $unwind: "$colorvariants"
      },
      {// Lookup to fetch size variants based on color variants
        $lookup: {
          from: "sizevariants",
          localField: "colorvariants._id",
          foreignField: "colorVariant",
          as: "sizevariants"
        }
      },
      {// Unwind the sizeVariants array
        $unwind: "$sizevariants"
      },
      {// Lookup to fetch images related to color variants
        $lookup: {
          from: "images",
          localField: "colorvariants._id",
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
          colorvariants: 1,
          sizevariants: 1,
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
            { $skip: skip },// Skip documents for pagination
            { $limit: 12 },
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
    console.log(err)
    return res.status(500).json(error("Something went wrong", res.statusCode));

  }
};

// @desc   Add a new product with its color variant(adds images to color variant) and adds size variants to color variant
// @route   POST /api/v1/product/
// @access  Private/Admin

exports.addProduct = async (req, res) => {
  let session = await mongoose.startSession();
  try {
    session.startTransaction();

    const {
      name,
      description,
      keyword,
      tag,
      categoryId,
      colorVariantName,
      sizeVariants
    } = req.body;

    if (!name) return res.status(400).json({ success: false, message: 'Name required' });
    if (!description) return res.status(400).json({ success: false, message: 'Description required' });
    if (!keyword) return res.status(400).json({ success: false, message: 'Keyword required' });
    if (!categoryId) return res.status(400).json({ success: false, message: 'Category id required' });
    if (!colorVariantName) return res.status(400).json({ success: false, message: 'Color variant name required' });

    if (!Array.isArray(sizeVariants)) {
      let arr = []
      arr.push(sizeVariants)
      sizeVariants = arr;
    }

    const colorVariantThumbnail = req.files['colorVariantThumbnail'][0];
    const images = req.files['images'];

    //convert to webp with quality 20%
    const colorVariantThumbnailWebp = await sharp(colorVariantThumbnail.buffer)
      .webp([{ near_lossless: true }, { quality: 20 }])
      .toBuffer();

    let colorVariantThumbnailInfo;
    await uploadTos3(colorVariantThumbnailWebp).then((result) => {
      colorVariantThumbnailInfo = result;
    })

    let imageUrlArr = [];
    if (images?.length >= 1) {
      for (var i = 0; i < images?.length; i++) {
        //convert each image to webp with quality 40%
        const webpImageBuffer = await sharp(images[i].buffer)
          .webp([{ near_lossless: true }, { quality: 40 }])
          .toBuffer();

        await uploadTos3(webpImageBuffer).then((result) => {
          imageUrlArr.push(result);
        })
      }
    }

    const product = new Product({
      name,
      description,
      keyword,
      tag: PRODUCT_TAG.contains(tag) ? tag : 'New arrival',
      category: categoryId,
    });

    const color_variant = new ColorVariant({
      name: colorVariantName,
      thumbnail: {
        url: colorVariantThumbnailInfo.url,
        filename: colorVariantThumbnailInfo.fileName
      },
      product: product._id,
    })

    await color_variant.save({ session });

    const imagePromises = imageUrlArr?.map(async (item) => {
      const image = new Image({
        url: item.url,
        filename: item.fileName,
        colorVariant: color_variant._id,
      });
      await image.save({ session });
      return image;
    });

    await Promise.all(imagePromises);

    const sizePromises = sizeVariants.map(async (size) => {
      const sizeVariantData = JSON.parse(size);
      const sizeVariant = new SizeVariant({
        name: sizeVariantData.name,
        mrp: sizeVariantData.mrp,
        selling_price: sizeVariantData.selling_price,
        stock: sizeVariantData.stock,
        status: sizeVariantData.status,
        colorVariant: color_variant._id,
      });
      await sizeVariant.save({ session });
      return sizeVariant;
    });

    await Promise.all(sizePromises);

    const savedProduct = await product.save({ session });
    await session.commitTransaction();
    session.endSession();

    res.status(201).json(success("OK", {
      product: savedProduct
    },
      res.statusCode),
    );
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json(error("Something went wrong", res.statusCode));
  }
};

// @desc   Adds color variant(and its size variants) of product
// @route   POST /api/v1/product/add_color_and_sizes
// @access  Private/Admin

exports.addColorAndItsSizeVariant = async (req, res) => {
  let session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      productId,
      colorVariantName
    } = req.body;

    if (!productId) return res.status(400).json({ success: false, message: 'Product id required' });
    if (!colorVariantName) return res.status(400).json({ success: false, message: 'color variant name required' });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json(error("Product not found!", res.statusCode));

    let sizeVariants = req.body.sizeVariants;
    if (!Array.isArray(sizeVariants)) {
      let arr = []
      arr.push(sizeVariants)
      sizeVariants = arr;
    }

    const colorVariantThumbnail = req.files['colorVariantThumbnail'][0];
    const images = req.files['images'];

    //convert to webp with quality 20%
    const colorVariantThumbnailWebp = await sharp(colorVariantThumbnail.buffer)
      .webp([{ near_lossless: true }, { quality: 20 }])
      .toBuffer();

    let colorVariantThumbnailInfo;
    await uploadTos3(colorVariantThumbnailWebp).then((result) => {
      colorVariantThumbnailInfo = result;
    })

    let imageUrlArr = [];
    if (images?.length >= 1) {
      for (var i = 0; i < images?.length; i++) {
        //convert each image to webp with quality 40%
        const webpImageBuffer = await sharp(images[i].buffer)
          .webp([{ near_lossless: true }, { quality: 40 }])
          .toBuffer();

        await uploadTos3(webpImageBuffer).then((result) => {
          imageUrlArr.push(result);
        })
      }
    }

    const color_variant = new ColorVariant({
      name: colorVariantName,
      thumbnail: {
        url: colorVariantThumbnailInfo.url,
        filename: colorVariantThumbnailInfo.fileName
      },
      product: product._id,
    })

    await color_variant.save({ session });

    const imagePromises = imageUrlArr?.map(async (item) => {
      const image = new Image({
        url: item.url,
        filename: item.fileName,
        colorVariant: color_variant._id,
      });
      await image.save({ session });
      return image;
    });

    await Promise.all(imagePromises);

    const sizePromises = sizeVariants.map(async (size) => {
      const sizeVariantData = JSON.parse(size);
      const sizeVariant = new SizeVariant({
        name: sizeVariantData.name,
        mrp: sizeVariantData.mrp,
        selling_price: sizeVariantData.selling_price,
        stock: sizeVariantData.stock,
        status: sizeVariantData.status,
        colorVariant: color_variant._id,
      });
      await sizeVariant.save({ session });
      return sizeVariant;
    });

    await Promise.all(sizePromises);

    const updatedProduct = await Product.findById(productId)
      .populate({
        path: 'colorvariants',
        populate: ['images', 'sizevariants']
      });

    await session.commitTransaction();

    return res.status(201).json(success("OK", {
      updatedProduct
    },
      res.statusCode),
    );
  } catch (err) {
    console.log(err)
    await session.abortTransaction();
    return res.status(500).json(error("Something went wrong", res.statusCode));
  }
};

// @desc   Add size variant of a color variant
// @route   POST /api/v1/product/add_size/:id
// @access  Private/Admin

exports.addSizeVariant = async (req, res) => {
  let session = await mongoose.startSession();
  try {
    session.startTransaction();

    const {
      name,
      status,
      stock,
      mrp,
      selling_price,
    } = req.body;

    if (!name) return res.status(400).json({ success: false, message: 'Name required' });
    if (!status) return res.status(400).json({ success: false, message: 'Status required' });
    if (!stock) return res.status(400).json({ success: false, message: 'Stock required' });
    if (!mrp) return res.status(400).json({ success: false, message: 'Mrp required' });
    if (!selling_price) return res.status(400).json({ success: false, message: 'Selling price required' });
    if (!req.params.id) return res.status(400).json({ success: false, message: 'Color variant id required' });


    const colorVariantId = req.params.id;

    const color_variant = await ColorVariant.findById(colorVariantId)
      .populate('sizevariants');

    if (!color_variant) return res.status(404).json(error("Color variant not found", res.statusCode));

    const size_variants = new SizeVariant({
      name,
      status,
      stock,
      mrp,
      selling_price,
      colorVariant: color_variant._id,
    })

    const AddedSizeVariant = await size_variants.save({ session });
    await session.commitTransaction();
    session.endSession();
    res.status(200).json(success("OK",
      AddedSizeVariant,
      res.statusCode),
    );
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json(error("Something went wrong", res.statusCode));
  }
};

// @desc   Add color variant images
// @route   POST /api/v1/product/add_image/:id
// @access  Private/Admin

exports.add_color_variant_image = async (req, res) => {
  let session = await mongoose.startSession();
  try {
    if (req.files['image'][0]) return res.status(400).json({ success: false, message: 'Image required' });

    session.startTransaction();

    const colorVariantImage = req.files['image'][0];

    //convert to webp with quality 20%
    const colorVariantImageWebp = await sharp(colorVariantImage.buffer)
      .webp([{ near_lossless: true }, { quality: 20 }])
      .toBuffer();

    let colorVariantImageInfo;

    await uploadTos3(colorVariantImageWebp).then((result) => {
      colorVariantImageInfo = result;
    })

    const color_variant = await ColorVariant.findById(req.params.id);
    if (!color_variant) return res.status(404).json(error("Color variant not found", res.statusCode));

    const image = new Image({
      url: colorVariantImageInfo.url,
      filename: colorVariantImageInfo.fileName,
      colorVariant: color_variant._id,
    })

    const newImage = await image.save({ session });
    await session.commitTransaction();
    session.endSession();
    res.status(200).json(success("OK", newImage,
      res.statusCode),
    );

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json(error("Something went wrong", res.statusCode));
  }
}

// @desc   Update is published
// @route   PUT /api/v1/product/toggle_is_published/:id
// @access  Private/Admin

exports.toggleIsPublished = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json(error("Product not found", res.statusCode));

    if (!product.isPublished) product.isPublished = false;

    const isPublished = product.isPublished
    product.isPublished = !isPublished;
    const updatedProduct = await product.save();

    res.status(200).json(success("OK", {
      product,
    },
      res.statusCode),
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json(error("Something went wrong", res.statusCode));
  }
};

// @desc   Update product information - name , description, keyword and tag
// @route   PUT /api/v1/product/product_info/:id
// @access  Private/Admin

exports.updateProductInfo = async (req, res) => {
  let session = await mongoose.startSession();
  try {
    session.startTransaction();

    const { name, description, keyword, tag, category } = req.body;

    if (!name) return res.status(400).json({ success: false, message: 'Name required' });
    if (!description) return res.status(400).json({ success: false, message: 'Description required' });
    if (!keyword) return res.status(400).json({ success: false, message: 'Keyword required' });
    if (!tag) return res.status(400).json({ success: false, message: 'Tag required' });
    if (!category) return res.status(400).json({ success: false, message: 'Category id required' });

    const productId = req.params.id;

    // Find the existing product by ID
    const existingProduct = await Product.findById(productId);

    if (!existingProduct) {
      return res.status(404).json(error("Product not found", res.statusCode));
    }

    // Update product details
    existingProduct.name = name;
    existingProduct.description = description;
    existingProduct.keyword = keyword;
    existingProduct.tag = tag;
    existingProduct.category = category;

    const updatedProduct = await existingProduct.save({ session });
    await session.commitTransaction();
    session.endSession();
    res.status(200).json(success("OK", {
      updatedProduct
    },
      res.statusCode),
    );
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json(error("Something went wrong", res.statusCode));
  }
};

// @desc   Update size variant of a color variant
// @route   PUT /api/v1/product/update_size/:id
// @access  Private/Admin

exports.update_size_variant = async (req, res) => {

  let session = await mongoose.startSession();
  try {
    session.startTransaction();

    const {
      name,
      status,
      stock,
      mrp,
      selling_price,
    } = req.body;

    if (!name) return res.status(400).json({ success: false, message: 'Name required' });
    if (!status) return res.status(400).json({ success: false, message: 'Status required' });
    if (!stock) return res.status(400).json({ success: false, message: 'Stock required' });
    if (!mrp) return res.status(400).json({ success: false, message: 'Mrp required' });
    if (!selling_price) return res.status(400).json({ success: false, message: 'Selling price required' });
    if (!req.params.id) return res.status(400).json({ success: false, message: 'Size variant id required' });

    const sizeVariantId = req.params.id;

    const size_variant = await SizeVariant.findById(sizeVariantId);
    if (!size_variant) return res.status(404).json(error("Color variant not found", res.statusCode));

    size_variant.name = name;
    size_variant.status = status;
    size_variant.stock = stock;
    size_variant.mrp = mrp;
    size_variant.selling_price = selling_price;

    const updatedSizeVariant = await size_variant.save({ session });
    await session.commitTransaction();
    session.endSession();
    res.status(200).json(success("OK", updatedSizeVariant,
      res.statusCode),
    );

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json(error("Something went wrong", res.statusCode));
  }
};

// @desc   Update thumbnail of a color variant
// @route   POST /api/v1/product/update_thumbnail/:id
// @access  Private/Admin

exports.update_thumbnail_image = async (req, res) => {
  let session = await mongoose.startSession();
  try {
    session.startTransaction();
    const {
      path
    } = req.body;

    if (!req.params.id) return res.status(400).json({ success: false, message: 'Color variant id required' });
    if (!path) return res.status(400).json({ success: false, message: 'File path required' });
    if (!req.files['thumbnail'][0]) return res.status(400).json({ success: false, message: 'Thumbnail required' });

    const colorVariantThumbnail = req.files['thumbnail'][0];

    //convert to webp with quality 20%
    const colorVariantThumbnailWebp = await sharp(colorVariantThumbnail.buffer)
      .webp([{ near_lossless: true }, { quality: 20 }])
      .toBuffer();


    let colorVariantThumbnailInfo;

    await uploadTos3(colorVariantThumbnailWebp).then((result) => {
      colorVariantThumbnailInfo = result;
    })

    const color_variant = await ColorVariant.findById(req.params.id);
    if (!color_variant) return res.status(404).json(error("Color variant not found", res.statusCode));

    color_variant.thumbnail = {
      url: colorVariantThumbnailInfo.url,
      filename: colorVariantThumbnailInfo.fileName
    };

    const updatedColorVariant = await color_variant.save({ session });
    await session.commitTransaction();
    session.endSession();
    if (updatedColorVariant) {
      await deleteS3Object(path)
    }

    res.status(200).json(success("OK", updatedColorVariant,
      res.statusCode),
    );
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json(error("Something went wrong", res.statusCode));
  }
}



// @desc   Update images of color variant
// @route   PUT /api/v1/product/update_image/:id
// @access  Private/Admin

exports.update_color_variant_image = async (req, res) => {
  let session = await mongoose.startSession();
  try {
    session.startTransaction();

    const {
      filename
    } = req.body;

    if (!req.params.id) return res.status(400).json({ success: false, message: 'Image id required' });
    if (!req.files['image'][0]) return res.status(400).json({ success: false, message: 'Color variant image required' });

    const colorVariantImage = req.files['image'][0];

    //convert to webp with quality 20%
    const colorVariantImageWebp = await sharp(colorVariantImage.buffer)
      .webp([{ near_lossless: true }, { quality: 20 }])
      .toBuffer();

    let colorVariantImageInfo;

    await uploadTos3(colorVariantImageWebp).then((result) => {
      colorVariantImageInfo = result;
    })

    const image = await Image.findById(req.params.id);

    if (!image) return res.status(404).json(error("Image not found", res.statusCode));

    image.url = colorVariantImageInfo.url;
    image.filename = colorVariantImageInfo.fileName;

    const updatedImage = await image.save({ session });
    await session.commitTransaction();
    session.endSession();

    if (updatedImage) {
      await deleteS3Object(filename)
    }

    res.status(200).json(success("OK",
      updatedImage,
      res.statusCode),
    );

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json(error("Something went wrong", res.statusCode));
  }
}

// @desc   Delete product
// @route   POST /api/v1/product/:id
// @access  Private/Admin

// todo: delete all related data eg. colorVariants, images and sizeVariants
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: 'Product id required' });


    const result = await Product.deleteOne({ _id: id });

    if (result.deletedCount === 0) return res.status(404).json(error("Product not found", res.statusCode));

    res.status(204).json(success("OK", {
    },
      res.statusCode),
    );
  } catch (err) {
    return res.status(500).json(error("Something went wrong", res.statusCode));
  }
};  
