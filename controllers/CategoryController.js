const Category = require('../models/Category');
const { success, error } = require('../common/responseAPI')
const { uploadTos3 } = require('../utils/s3')

// @desc   Get all categories
// @route   GET /api/v1/category/
// @access  Public

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json(success("OK", categories, res.statusCode));
    } catch (err) {
        console.error(err);
        return res.status(500).json(error("Something went wrong", res.statusCode));
    }
};

// @desc   Add category
// @route   POST /api/v1/category/
// @access  Admin/Private

exports.addCategory = async (req, res) => {
    let session = await mongoose.startSession();
    try {
        session.startTransaction();

        let { name } = req.body;
        if (!name) return res.status(400).json({ success: false, message: 'Name required' });
        if (!req.files['image'][0]) return res.status(400).json({ success: false, message: 'Banner Image required' });

        const bannerImage = req.files['image'][0];

        //convert to webp with quality 20%
        const bannerImageWebp = await sharp(bannerImage.buffer)
            .webp([{ near_lossless: true }, { quality: 20 }])
            .toBuffer();

        let bannerImageInfo;

        await uploadTos3(bannerImageWebp).then((result) => {
            bannerImageInfo = result;
        })

        const categories = await Category.create(
            [{
                name,
                bannerImage: {
                    url: bannerImageInfo.url,
                    filename: bannerImageInfo.fileName
                }
             }],
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        res.status(201).json(success("OK", {
            categories
        },
            res.statusCode),
        );
    } catch (err) {
        console.error(err);
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json(error("Something went wrong", res.statusCode));
    }
};

// @desc   Update category
// @route   PUT /api/v1/category/
// @access  Admin/Private

exports.updateCategory = async (req, res) => { 
    let session = await mongoose.startSession();
    try {
        session.startTransaction();
        const { id } = req.params;
        const {
            path,
            name,
            isActive
        } = req.body;

        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json(error("Category not found", res.statusCode));
        
        if (req?.files && req?.files['image'] && req?.files['image'][0] !== null && path) {
            const bannerImage = req.files['image'][0];

            //convert to webp with quality 20%
            const bannerImageWebp = await sharp(bannerImage.buffer)
                .webp([{ near_lossless: true }, { quality: 20 }])
                .toBuffer();

            let bannerImageInfo;

            await uploadTos3(bannerImageWebp).then((result) => {
                bannerImageInfo = result;
            })

            category.bannerImage = {
                url: bannerImageInfo.url,
                filename: bannerImageInfo.fileName
            };
        }

        if (name) {
            category.name = name;
        }
        
        if (isActive) {
            category.isActive = isActive;
        }
        
        const updatedCategory = await category.save({ session });
        await session.commitTransaction();
        session.endSession();

        if (path && updatedCategory) { 
            await deleteS3Object(path)
        }
        
        res.status(200).json(success("OK", {
            updatedCategory
        },
            res.statusCode),
        );
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json(error("Something went wrong", res.statusCode));
    }
};

//category is related to products it should not be deleted.

// @desc   Delete category
// @route   DELETE /api/v1/category/:id
// @access  Admin/Private

// exports.deleteCategory = async (req, res) => {
//     try {
//         const { id } = req.params;

//         // Use deleteOne to delete the product
//         const result = await Category.deleteOne({ _id: id }); // Assuming id is the document's _id

//         // Check if the document was found and deleted
//         if (result.deletedCount === 0) {
// return res.status(404).json(error("Category not found", res.statusCode));
//         }

//  res.status(204).json(success("OK", {
   
// },
//     res.statusCode),
// );
//     } catch (error) {
//         console.error(error);
// return res.status(500).json(error("Something went wrong", res.statusCode));
//     }
// };  