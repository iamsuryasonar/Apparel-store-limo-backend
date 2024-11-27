// Reset user password: POST /reset-password
// Change user password: PUT /change-password
const config = require('../config')
const Customer = require('../models/Customer');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { success, error, validation } = require('../common/responseAPI')
const Admin = require('../models/Admin');
const { generateToken } = require('../utils/generateToken')

// @desc   Admin registration
// @route   POST /api/v1/auth/admin_register
// @access  Public

exports.adminRegistration = async (req, res) => {
  try {
    if (!req.body.name) return res.status(422).json(validation({ name: "Name is required" }));
    if (!req.body.email) return res.status(422).json(validation({ email: "Email is required" }));
    if (!req.body.password) return res.status(422).json(validation({ password: "Password is required" }));

    const emailExist = await Admin.findOne({ email: req.body.email })

    if (emailExist) return res.status(400).json(error("Email already exist", res.statusCode));

    const hashedPassword = bcrypt.hashSync(req.body.password, 10)

    const admin = new Admin({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    })

    const savedAdmin = await admin.save();
    res.status(201).json(success("Admin registered successfully", {
    },
      res.statusCode),
    );
  } catch (err) {
    return res.status(500).json(error("Something went wrong", res.statusCode));
  }

};

// @desc   Admin login
// @route   POST /api/v1/auth/admin_login
// @access  Public

exports.adminLogIn = async (req, res) => {
  try {

    if (!req.body.email) return res.status(422).json(validation({ email: "Email is required" }));
    if (!req.body.password) return res.status(42).json(validation({ password: "Password is required" }));

    // check if email exists in the database and get the user's password(data) so that we can compare hashes
    const admin = await Admin.findOne({ email: req.body.email })
    if (!admin) return res.status(400).json(error("Email not found", res.statusCode));


    const matched = await bcrypt.compare(req.body.password, admin.password);
    if (!matched) return res.status(400).json(error("Invalid Password", res.statusCode));

    const token = generateToken({ _id: admin._id, role: admin.role })
    const userinfo = {
      'name': admin.name,
      'email': admin.email,
    }

    res.status(200).json(success("OK", {
      ...userinfo, token
    },
      res.statusCode),
    );
  } catch (err) {
    console.log(err)
    return res.status(500).json(error("Something went wrong", res.statusCode));
  }
};

// @desc   Customer registration
// @route   POST /api/v1/auth/customer_register
// @access  Public

exports.customerRegistration = async (req, res) => {
  try {
    if (!req.body.firstName) return res.status(422).json(validation({ firstName: "First name is required" }));
    if (!req.body.lastName) return res.status(422).json(validation({ lastName: "Last name is required" }));
    if (!req.body.email) return res.status(422).json(validation({ email: "Email is required" }));
    if (!req.body.password) return res.status(42).json(validation({ password: "Password is required" }));

    const emailExist = await Customer.findOne({ email: req.body.email })
    if (emailExist) return res.status(400).json(error("Email already exist", res.statusCode));

    const hashedPassword = bcrypt.hashSync(req.body.password, 10)

    const customer = new Customer({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: hashedPassword
    })

    const savedUser = await customer.save();
    res.status(201).json(success("User registered", {
    },
      res.statusCode),
    );
  } catch (err) {
    return res.status(500).json(error("Something went wrong", res.statusCode));
  }
};

// @desc   Customer login
// @route   POST /api/v1/auth/customer_register
// @access  Public

exports.customerLogIn = async (req, res) => {
  try {

    if (!req.body.email) return res.status(422).json(validation({ email: "Email is required" }));
    if (!req.body.password) return res.status(42).json(validation({ password: "Password is required" }));

    const customer = await Customer.findOne({ email: req.body.email })
    if (!customer) return res.status(404).json(error("Email not found", res.statusCode));

    const matched = await bcrypt.compare(req.body.password, customer.password);
    if (!matched) return res.status(400).json(error("Invalid Password", res.statusCode));

    const token = jwt.sign({ _id: customer._id, role: customer.role, exp: Math.floor(Date.now() / 1000) + 10 * 24 * 3600, }, config.jwt.tokenSecret)

    const userinfo = {
      'firstName': customer.firstName,
      'lastName': customer.lastName,
      'email': customer.email,
    }

    res.status(200).json(success("OK", {
      ...userinfo, token
    },
      res.statusCode),
    );

  } catch (err) {
    return res.status(500).json(error("Something went wrong", res.statusCode));
  }
};
