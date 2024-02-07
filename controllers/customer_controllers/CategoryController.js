const Category = require('../../models/Category');
const { success, error } = require('../../common/responseAPI')

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json(success("OK", categories, res.statusCode));

    } catch (err) {
        console.error(err);
        return res.status(500).json(error("Something went wrong", res.statusCode));
    }
};
