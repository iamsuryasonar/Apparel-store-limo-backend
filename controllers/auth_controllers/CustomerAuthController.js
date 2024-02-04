// Reset user password: POST /reset-password
// Change user password: PUT /change-password

const Customer = require('../../models/Customer');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { success, error, validation } = require('../../common/responseAPI')

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
    res.status(201).json(success("OK", {
    },
      res.statusCode),
    );
  } catch (err) {
    return res.status(500).json(error("Something went wrong", res.statusCode));
  }
};

exports.customerLogIn = async (req, res) => {
  try {

    if (!req.body.email) return res.status(422).json(validation({ email: "Email is required" }));
    if (!req.body.password) return res.status(42).json(validation({ password: "Password is required" }));

    const customer = await Customer.findOne({ email: req.body.email })
    if (!customer) return res.status(404).json(error("Email not found", res.statusCode));

    const matched = await bcrypt.compare(req.body.password, customer.password);
    if (!matched) return res.status(400).json(error("Invalid Password", res.statusCode));

    const token = jwt.sign({ _id: customer._id, role: customer.role, exp: Math.floor(Date.now() / 1000) + 3 * 3600, }, process.env.TOKEN_SECRET)

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
