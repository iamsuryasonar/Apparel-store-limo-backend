const Category = require('../../models/Category');
const mongoose = require('mongoose')
const { success, error, validation } = require('../../common/responseAPI')
const sharp = require('sharp')
const { uploadTos3, deleteS3Object } = require('../../middlewares/multerConfig')

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json(success("OK", {
            categories
        },
            res.statusCode),
        );
    } catch (err) {
        console.error(err);
        return res.status(500).json(error("Something went wrong", res.statusCode));
    }
};

exports.addCategory = async (req, res) => {
    try {
    var session = await mongoose.startSession();
    session.startTransaction();

        let { name } = req.body;
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

        res.status(201).json(success("OK", {
            categories
        },
            res.statusCode),
        );
    } catch (err) {
            await session.abortTransaction();
            return res.status(500).json(error("Something went wrong", res.statusCode));
        } finally {
            session.endSession();
        }
};

exports.updateCategory = async (req, res) => { 
    try {
        var session = await mongoose.startSession();
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

        if (path && updatedCategory) { 
            await deleteS3Object(path).then((result) => {
            })
        }
        
        res.status(200).json(success("OK", {
            updatedCategory
        },
            res.statusCode),
        );
    } catch (err) {
        await session.abortTransaction();
        return res.status(500).json(error("Something went wrong", res.statusCode));
    }finally {
        session.endSession();
    }
};

//category is related to products it should not be deleted.

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