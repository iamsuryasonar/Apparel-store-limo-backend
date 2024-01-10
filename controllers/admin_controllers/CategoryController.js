const Category = require('../../models/Category');
const mongoose = require('mongoose')

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json({
            categories,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

exports.addCategory = async (req, res) => {
    let session = await mongoose.startSession();
    session.startTransaction();

    try {
        let { name, bannerImage } = req.body;

        const categories = await Category.create(
            [{ name, bannerImage }],
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({ categories });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();

        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, bannerImage, isActive } = req.body;

        const result = await Category.updateOne(
            { _id: id },
            {
                $set: {
                    name: name || '',
                    bannerImage: bannerImage || '',
                    isActive: isActive || true,
                },
            }
        );

        if (result.nModified === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }

        const updatedCategory = await Category.findById(id);

        res.status(200).json(updatedCategory);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
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
//             return res.status(404).json({ error: 'Category not found' });
//         }

//         res.status(204).json({ message: 'Category deleted successfully!' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// };  