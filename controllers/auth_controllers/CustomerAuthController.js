// Reset user password: POST /reset-password
// Change user password: PUT /change-password

const Customer = require('../../models/Customer');
const Joi = require('joi')
const { registerValidation, loginValidation } = require('../../middlewares/authValidation')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const utils = require('../../common/utility')

exports.customerRegistration = async (req, res) => {
  if (!req.body.firstName) return res.status(400).json({ success: false, message: 'first name required!!!' });
  if (!req.body.lastName) return res.status(400).json({ success: false, message: 'last name required!!!' });
  if (!req.body.email) return res.status(400).json({ success: false, message: 'email required!!!' });
  if (!req.body.password) return res.status(400).json({ success: false, message: 'password required!!!' });

  //check if email exists in the database
  const emailExist = await Customer.findOne({ email: req.body.email })

  if (emailExist) return utils.responseHandler(res, 400, 'error', 'Email already exists', null);
  // if (emailExist) return res.status(400).json({ error: 'Email already exists' });
  try {

    // hash password using bcrypt 
    const hashedPassword = bcrypt.hashSync(req.body.password, 10)

    //calling User construction to create a new user with type User
    const customer = new Customer({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: hashedPassword
    })

    // Mongoose provides a save function that will take a JSON 
    // object and store it in the database. Our body-parser (in our case express.json) middleware,
    // will convert the user’s input into the JSON format for us.

    const savedUser = await customer.save();
    // res.json({ message: 'User registered successfully' });
    utils.responseHandler(res, 201, 'success', 'Customer registered successfully', null);
  } catch (error) {
    utils.responseHandler(res, 500, 'error', 'Internal server error', null);
  }
};

exports.customerLogIn = async (req, res) => {

  if (!req.body.email) return res.status(400).json({ success: false, message: 'email required!!!' });
  if (!req.body.password) return res.status(400).json({ success: false, message: 'password required!!!' });

  // try {
  // check if email exists in the database and get the user's password(data) so that we can compare hashes
  const customer = await Customer.findOne({ email: req.body.email })
  if (!customer) return utils.responseHandler(res, 400, 'error', 'Email not found', null);

  const matched = await bcrypt.compare(req.body.password, customer.password);
  if (!matched) return utils.responseHandler(res, 400, 'error', 'Invalid Password', null);

  // create token using jsonwebtoken library
  const token = jwt.sign({ _id: customer._id }, process.env.TOKEN_SECRET)
  const userData = await Customer.findOne({ email: req.body.email })
  const userinfo = {
    'firstName': userData.firstName,
    'lastName': userData.lastName,
    'email': userData.email,
  }
  const response = { ...userinfo, token }
  utils.responseHandler(res, 200, 'success', 'User logged in successfully', response);
  // } catch (error) {
  //   utils.responseHandler(res, 500, 'error', 'Internal server error', null);
  // }
};
