const mongoose = require('mongoose')
const { success, error, validation } = require('../common/responseAPI')
const Address = require('../models/Address')


// @desc    Create address
// @route   POST /api/v1/address/
// @access  Private/Customer

exports.addAddress = async (req, res) => {
    try {
        let {
            name,
            contact_number,
            house_number,
            landmark,
            town,
            city,
            pin,
            state,
            country,
        } = req.body;

        const customerId = req?.user._id;
        if (!customerId) return res.status(400).json(error("Can't add address", res.statusCode));

        const address = new Address({
            name,
            contact_number: contact_number,
            house_number: house_number,
            landmark,
            town,
            city,
            pin,
            state,
            country,
            customer: customerId
        });

        const new_address = await address.save();

        res.status(201).json(success("OK", new_address,
            res.statusCode),
        );
    } catch (err) {
        console.log(err)
        return res.status(500).json(error("Something went wrong", res.statusCode));
    }
};

// @desc    Update address
// @route   PUT /api/v1/address/
// @access  Private/Customer

exports.updateAddress = async (req, res) => {
    try {
        const {
            id,
            name,
            contact_number,
            house_number,
            landmark,
            town,
            city,
            pin,
            state,
            country,
        } = req.body;

        const customerId = req?.user._id;
        if (!customerId) return res.status(400).json(error("Can't update address", res.statusCode));

        const address = await Address.find({ _id: req.params.id, customer: customerId });

        if (!address) return res.status(404).json(error("Address not found", res.statusCode));

        const updatedAddress = await Address.findByIdAndUpdate(
            { _id: req.params.id, customer: customerId },
            {
                name,
                contact_number,
                house_number,
                landmark,
                town,
                city,
                pin,
                state,
                country,
            },
        );

        res.status(200).json(success("Address updated successfully", updatedAddress, res.statusCode));
    } catch (err) {
        console.log(err);
        return res.status(500).json(error("Something went wrong", res.statusCode));
    }
};


// @desc   Get all addresses
// @route   GET /api/v1/address/
// @access  Private/Customer

exports.getAllAddresses = async (req, res) => {
    try {
        const customerId = req?.user._id;
        if (!customerId) return res.status(404).json(error("", res.statusCode));

        const address = await Address.find({ customer: customerId }).sort({ createdAt: -1 }).exec();

        res.status(200).json(success("OK",
            address,
            res.statusCode),
        );
    } catch (err) {
        console.error(err);
        return res.status(500).json(error("Something went wrong", res.statusCode));
    }
};

// @desc    Delete address
// @route   PUT /api/v1/address/:id
// @access  Private/Customer

exports.deleteAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const customerId = req.user._id;
        if (!customerId) return res.status(404).json(error("", res.statusCode));

        const address = await Address.find({ _id: req.params.id, customer: customerId });

        if (!address) return res.status(404).json(error("Address not found", res.statusCode));

        let deletedAddress = await Address.deleteOne({ _id: req.params.id });

        res.status(201).json(success("OK", {
            deletedAddress
        },
            res.statusCode),
        );
    } catch (err) {
        console.log(err)
        return res.status(500).json(error("Something went wrong", res.statusCode));
    }
};
