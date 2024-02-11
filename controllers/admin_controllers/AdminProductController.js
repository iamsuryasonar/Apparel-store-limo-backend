const Product = require('../../models/Product');
const Category = require('../../models/Category');
const SizeVariant = require('../../models/SizeVariant');
const ColorVariant = require('../../models/ColorVariant');
const Image = require('../../models/Image');
const sharp = require('sharp');
const { uploadTos3, deleteS3Object } = require('../../middlewares/multerConfig');
const { success, error, validation } = require('../../common/responseAPI')
const mongoose = require("mongoose");

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
      colorVariantName
    } = req.body;

    if (!name) return res.status(400).json({ success: false, message: 'Name required' });
    if (!description) return res.status(400).json({ success: false, message: 'Description required' });
    if (!keyword) return res.status(400).json({ success: false, message: 'Keyword required' });
    if (!tag) return res.status(400).json({ success: false, message: 'Tag required' });
    if (!categoryId) return res.status(400).json({ success: false, message: 'Category id required' });
    if (!colorVariantName) return res.status(400).json({ success: false, message: 'Color variant name required' });

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

    const product = new Product({
      name,
      description,
      keyword,
      tag,
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
  } finally {
    session.endSession();
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Use find to retrieve paginated products
    const products = await Product.find()
      .populate({
        path: 'colorvariants',
        populate: ['images', 'sizevariants']
      })
      .skip(skip)
      .limit(limit)
      .exec();

    // Get the total count of products
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
    return res.status(500).json(error("Something went wrong", res.statusCode));
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate('category')
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

exports.getProductsByCategoryId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) return res.status(400).json({ success: false, message: 'Category id required' });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const category = await Category.findById(id);
    if (!category) return res.status(422).json(validation({ categoryId: "Invalid category id" }));

    const products = await Product.find({ category: id })
      .populate({
        path: 'colorvariants',
        populate: ['images', 'sizevariants']
      })
      .exec()
      .skip(skip)
      .limit(limit);

    // Get the total count of products
    const totalOrders = products.length;

    const totalPages = Math.ceil(totalProducts / limit);

    const categories = await Category.find();

    //Todo: this line is not necessary, test and delete this line
    if (!products || products.length === 0) return res.status(404).json(error("Products not found", res.statusCode));

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