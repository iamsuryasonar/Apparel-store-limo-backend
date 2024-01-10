const Product = require('../../models/Product');
const Category = require('../../models/Category');
const SizeVariant = require('../../models/SizeVariant');
const ColorVariant = require('../../models/ColorVariant');
const Image = require('../../models/Image');
const sharp = require('sharp');
const { uploadTos3, deleteS3Object } = require('../../middlewares/multerConfig');

exports.addProduct = async (req, res) => {
  try {
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

    let imageUrlArr;
    //convert each image to webp with quality 40%
    if (images?.length >= 1) {
      imageUrlArr = await Promise.all(images.map(async (image) => {
        try {
          const webpImageBuffer = await sharp(image.buffer)
            .webp([{ near_lossless: true }, { quality: 40 }])
            .toBuffer();

          const result = await uploadTos3(webpImageBuffer);
          return result;
        } catch (error) {
          console.error('Error processing image:', error);
          throw error;
        }
      }));
    }


    const {
      name,
      description,
      keyword,
      tag,
      categoryId,
      colorVariantName
    } = req.body;

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

    await color_variant.save();

    imageUrlArr?.forEach(async (item) => {
      const image = new Image({
        url: item.url,
        filename: item.fileName,
        colorVariant: color_variant._id,
      })

      await image.save();

    }),
      sizeVariants.forEach(async (size) => {
        const size_variants = new SizeVariant({
          name: JSON.parse(size).name,
          mrp: JSON.parse(size).mrp,
          selling_price: JSON.parse(size).selling_price,
          stock: JSON.parse(size).stock,
          status: JSON.parse(size).status,
          colorVariant: color_variant._id,
        })

        await size_variants.save();

      })

    const savedProduct = await product.save();

    res.status(201).json({ message: 'Product created successfully', productId: savedProduct._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.addColorAndItsSizeVariant = async (req, res) => {
  try {
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

    let imageUrlArr;
    //convert each image to webp with quality 40%
    if (images?.length >= 1) {
      imageUrlArr = await Promise.all(images.map(async (image) => {
        try {
          const webpImageBuffer = await sharp(image.buffer)
            .webp([{ near_lossless: true }, { quality: 40 }])
            .toBuffer();

          const result = await uploadTos3(webpImageBuffer);
          return result;
        } catch (error) {
          console.error('Error processing image:', error);
          throw error;
        }
      }));
    }

    const {
      productId,
      colorVariantName
    } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found!!!' });

    const color_variant = new ColorVariant({
      name: colorVariantName,
      thumbnail: {
        url: colorVariantThumbnailInfo.url,
        filename: colorVariantThumbnailInfo.fileName
      },
      product: product._id,
    })

    await color_variant.save();

    imageUrlArr?.forEach(async (item) => {
      const image = new Image({
        url: item.url,
        filename: item.fileName,
        colorVariant: color_variant._id,
      })

      await image.save();

    }),
      sizeVariants.forEach(async (size) => {
        const size_variants = new SizeVariant({
          name: JSON.parse(size).name,
          mrp: JSON.parse(size).mrp,
          selling_price: JSON.parse(size).selling_price,
          stock: JSON.parse(size).stock,
          status: JSON.parse(size).status,
          colorVariant: color_variant._id,
        })

        await size_variants.save();

      })

    const updatedProduct = await Product.findById(productId)
      .populate({
        path: 'colorvariants',
        populate: ['images', 'sizevariants']
      });

    res.status(201).json({ message: 'Color variant and its size variant added successfully!!', updatedProduct: updatedProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
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

    const product = await Product.findById(id)
      .populate({
        path: 'colorvariants',
        populate: ['images', 'sizevariants']
      })
      .exec()

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};



exports.toggleIsPublished = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (!product.isPublished) {
      product.isPublished = false;
    }

    const isPublished = product.isPublished
    product.isPublished = !isPublished;
    const updatedProduct = await product.save();

    res.status(200).json(updatedProduct);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getProductsByCategoryId = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    const skip = (page - 1) * pageSize;

    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ error: 'Invalid category id' });

    const products = await Product.find({ category: id })
      .populate({
        path: 'colorvariants',
        populate: ['images', 'sizevariants']
      })
      .exec()
      .skip(skip)
      .limit(pageSize);

    if (!products || products.length === 0) {
      return res.status(404).json({ error: 'Products not found' });
    }

    res.status(200).json({
      category,
      products,
      pagination: {
        currentPage: page,
        pageSize,
        totalProducts: products.length, // You might want to query the total count for more accurate pagination
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


exports.updateProductInfo = async (req, res) => {
  try {
    const { name, description, keyword, tag, categoryId } = req.body;
    const productId = req.params.id;

    // Find the existing product by ID
    const existingProduct = await Product.findById(productId);

    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update product details
    existingProduct.name = name;
    existingProduct.description = description;
    existingProduct.keyword = keyword;
    existingProduct.tag = tag;
    existingProduct.category = categoryId;

    // Save the updated product
    const updatedProduct = await existingProduct.save();

    res.status(200).json({ message: 'Product updated successfully', productId: updatedProduct._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.addSizeVariant = async (req, res) => {
  try {
    const {
      name,
      status,
      stock,
      mrp,
      selling_price,
    } = req.body;
    const colorVariantId = req.params.id;

    const color_variant = await ColorVariant.findById(colorVariantId)
      .populate('sizevariants');

    if (!color_variant) return res.status(404).json({ message: 'Color variant not found!!!' });

    const size_variants = new SizeVariant({
      name,
      status,
      stock,
      mrp,
      selling_price,
      colorVariant: color_variant._id,
    })
    await size_variants.save();

    res.status(201).json({ message: 'Size variant added successfully!!', });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.update_size_variant = async (req, res) => {

  try {
    const {
      name,
      status,
      stock,
      mrp,
      selling_price,
    } = req.body;
    const sizeVariantId = req.params.id;

    const size_variant = await SizeVariant.findById(sizeVariantId);

    if (!size_variant) return res.status(404).json({ message: 'Color variant not found!!!' });

    size_variant.name = name;
    size_variant.status = status;
    size_variant.stock = stock;
    size_variant.mrp = mrp;
    size_variant.selling_price = selling_price;
    await size_variant.save();

    res.status(201).json({ message: 'Size variant updated successfully!!', });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.update_thumbnail_image = async (req, res) => {
  try {
    const {
      path
    } = req.body;

    const colorVariantThumbnail = req.files['thumbnail'][0];

    //convert to webp with quality 20%
    const colorVariantThumbnailWebp = await sharp(colorVariantThumbnail.buffer)
      .webp([{ near_lossless: true }, { quality: 20 }])
      .toBuffer();


    let colorVariantThumbnailInfo;
    await uploadTos3(colorVariantThumbnailWebp).then((result) => {
      colorVariantThumbnailInfo = result;
    })

    await deleteS3Object(path).then((result) => {
    })



    const color_variant = await ColorVariant.findById(req.params.id);
    if (!color_variant) return res.status(404).json({ message: 'Color variant not found!!!' });

    color_variant.thumbnail = {
      url: colorVariantThumbnailInfo.url,
      filename: colorVariantThumbnailInfo.fileName
    };

    const updatedColorVariant = await color_variant.save();

    res.status(201).json({ message: 'Color variant thumbnail updated successfully!!', updatedColorVariant: updatedColorVariant });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.add_color_variant_image = async (req, res) => {
  try {
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
    if (!color_variant) return res.status(404).json({ message: 'Color variant not found!!!' });

    const image = new Image({
      url: colorVariantImageInfo.url,
      filename: colorVariantImageInfo.fileName,
      colorVariant: color_variant._id,
    })

    const newImage = await image.save();

    res.status(201).json({ message: 'Color variant image added successfully!!', newImage: newImage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.update_color_variant_image = async (req, res) => {
  try {
    const {
      filename
    } = req.body;
    const colorVariantImage = req.files['image'][0];

    //convert to webp with quality 20%
    const colorVariantImageWebp = await sharp(colorVariantImage.buffer)
      .webp([{ near_lossless: true }, { quality: 20 }])
      .toBuffer();

    let colorVariantImageInfo;
    await uploadTos3(colorVariantImageWebp).then((result) => {
      colorVariantImageInfo = result;
    })

    await deleteS3Object(filename).then((result) => {
    })

    const image = await Image.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ message: 'Image not found!!!' });
    }
    image.url = colorVariantImageInfo.url;
    image.filename = colorVariantImageInfo.fileName;
    const updatedImage = await image.save();

    res.status(201).json({ message: 'Color variant image updated successfully!!', updatedImage: updatedImage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

//todo below api might not work

// API to update a colorVariant of a product
// router.put('/updateColorVariant/:productId/:colorVariantId',
exports.updateColorVariantByID = async (req, res) => {
  try {
    const { name, thumbnail } = req.body;
    const productId = req.params.productId;
    const colorVariantId = req.params.colorVariantId;

    const existingProduct = await Product.findById(productId);

    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const colorVariantToUpdate = existingProduct.colorVariants.find(color => color._id.toString() === colorVariantId);

    if (!colorVariantToUpdate) {
      return res.status(404).json({ message: 'ColorVariant not found' });
    }

    colorVariantToUpdate.name = name;
    colorVariantToUpdate.thumbnail = thumbnail;

    const updatedProduct = await existingProduct.save();

    res.status(200).json({ message: 'ColorVariant updated successfully', productId: updatedProduct._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



// API to update a single sizeVariant of a colorVariant in a product
// router.put('/updateSizeVariant/:productId/:colorVariantId/:sizeVariantId',
exports.updateSizeVariantByID = async (req, res) => {
  try {
    const { mrp, selling_price, stock, status } = req.body;
    const productId = req.params.productId;
    const colorVariantId = req.params.colorVariantId;
    const sizeVariantId = req.params.sizeVariantId;

    const existingProduct = await Product.findById(productId);

    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const colorVariantToUpdate = existingProduct.colorVariants.find(color => color._id.toString() === colorVariantId);

    if (!colorVariantToUpdate) {
      return res.status(404).json({ message: 'ColorVariant not found' });
    }

    const sizeVariantToUpdate = colorVariantToUpdate.sizeVariants.find(size => size._id.toString() === sizeVariantId);

    if (!sizeVariantToUpdate) {
      return res.status(404).json({ message: 'SizeVariant not found' });
    }

    sizeVariantToUpdate.mrp = mrp;
    sizeVariantToUpdate.selling_price = selling_price;
    sizeVariantToUpdate.stock = stock;
    sizeVariantToUpdate.status = status;

    const updatedProduct = await existingProduct.save();

    res.status(200).json({ message: 'SizeVariant updated successfully', productId: updatedProduct._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// todo: delete all related data ex. colorVariants, images and sizeVariants
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await Product.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(204).json({ message: 'Product deleted successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};  