// Reset user password: POST /reset-password
// Change user password: PUT /change-password

const Admin = require('../../models/Admin');
const router = require('express').Router()
const Joi = require('joi')
const { registerValidation, loginValidation } = require('../../middlewares/authValidation')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const utils = require('../../common/utility')


exports.adminRegistration = async (req, res) => {

  if (!req.body.name) return res.status(400).json({ success: false, message: 'name required!!!' });
  if (!req.body.email) return res.status(400).json({ success: false, message: 'email required!!!' });
  if (!req.body.password) return res.status(400).json({ success: false, message: 'password required!!!' });

  //check if email exists in the database
  const emailExist = await Admin.findOne({ email: req.body.email })

  if (emailExist) return utils.responseHandler(res, 400, 'error', 'Email already exists', null);
  // if (emailExist) return res.status(400).json({ error: 'Email already exists' });


  // hash password using bcrypt 
  const hashedPassword = bcrypt.hashSync(req.body.password, 10)

  //calling User construction to create a new user with type User
  const admin = new Admin({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
  })
  try {
    // Mongoose provides a save function that will take a JSON 
    // object and store it in the database. Our body-parser (in our case express.json) middleware,
    // will convert the user’s input into the JSON format for us.

    const savedAdmin = await admin.save();
    // res.json({ message: 'Admin registered successfully' });
    utils.responseHandler(res, 201, 'success', 'Admin registered successfully', null);
  } catch (error) {
    utils.responseHandler(res, 500, 'error', 'Internal server error', null);
  }

};

exports.adminLogIn = async (req, res) => {
  console.log(req.body)
  if (!req.body.email) return res.status(400).json({ success: false, message: 'email required!!!' });
  if (!req.body.password) return res.status(400).json({ success: false, message: 'password required!!!' });

  // try {

  // check if email exists in the database and get the user's password(data) so that we can compare hashes
  const admin = await Admin.findOne({ email: req.body.email })
  if (!admin) return utils.responseHandler(res, 400, 'error', 'Email not found', null);

  const matched = await bcrypt.compare(req.body.password, admin.password);
  if (!matched) return utils.responseHandler(res, 400, 'error', 'Invalid Password', null);

  // create token using jsonwebtoken library
  const token = jwt.sign({ _id: admin._id, role: admin.role, exp: Math.floor(Date.now() / 1000) + 3 * 3600, }, process.env.TOKEN_SECRET,)
  const userData = await Admin.findOne({ email: req.body.email })
  const userinfo = {
    'name': userData.name,
    'email': userData.email,
  }
  const response = { ...userinfo, token }
  utils.responseHandler(res, 200, 'success', 'Admin logged in successfully', response);
  // } catch (error) {
  //   utils.responseHandler(res, 500, 'error', 'Internal server error', null);
  // }

};
